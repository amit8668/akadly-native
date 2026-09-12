# MFRC522 RFID reader driver for MicroPython (SPI).
#
# Original implementation written for Akadly (native). The register
# addresses and command opcodes below are fixed values defined by the
# public NXP MFRC522 datasheet (section 9, "Register and Command
# Overview") - they are how the chip itself is addressed, not creative
# content, so any correct driver for this chip talks to the same
# addresses. The code structure, naming, and control flow here are
# written from scratch rather than taken from any existing driver.
#
# Public API (kept stable since generated Blocks code calls it directly):
#   MFRC522(sck, mosi, miso, rst, cs)
#   .OK / .NO_TAG / .ERROR, .REQIDL / .REQALL, .AUTHENT1A / .AUTHENT1B
#   .request(mode) -> (status, valid_bits)
#   .anticoll() -> (status, uid_bytes)
#   .select_tag(uid) -> status
#   .auth(mode, block_addr, key, uid) -> status
#   .stop_crypto()
#   .read(block_addr) -> data or None
#   .write(block_addr, data) -> status

from machine import Pin, SoftSPI


class MFRC522:
    OK = 0
    NO_TAG = 1
    ERROR = 2

    REQIDL = 0x26
    REQALL = 0x52
    AUTHENT1A = 0x60
    AUTHENT1B = 0x61

    # PCD (reader-side) command codes.
    _CMD_IDLE = 0x00
    _CMD_CALC_CRC = 0x03
    _CMD_TRANSCEIVE = 0x0C
    _CMD_RESET = 0x0F
    _CMD_AUTHENT = 0x0E

    # Register addresses.
    _REG_COMMAND = 0x01
    _REG_COM_IRQ_EN = 0x02
    _REG_COM_IRQ = 0x04
    _REG_DIV_IRQ = 0x05
    _REG_ERROR = 0x06
    _REG_STATUS2 = 0x08
    _REG_FIFO_DATA = 0x09
    _REG_FIFO_LEVEL = 0x0A
    _REG_CONTROL = 0x0C
    _REG_BIT_FRAMING = 0x0D
    _REG_MODE = 0x11
    _REG_TX_CONTROL = 0x14
    _REG_TX_ASK = 0x15
    _REG_CRC_RESULT_M = 0x21
    _REG_CRC_RESULT_L = 0x22
    _REG_T_MODE = 0x2A
    _REG_T_PRESCALER = 0x2B
    _REG_T_RELOAD_H = 0x2C
    _REG_T_RELOAD_L = 0x2D

    def __init__(self, sck, mosi, miso, rst, cs):
        self._cs = Pin(cs, Pin.OUT, value=1)
        self._rst = Pin(rst, Pin.OUT, value=0)
        # Bit-banged SPI works on any pin combination across every board
        # this app supports, unlike a fixed hardware SPI peripheral.
        self._spi = SoftSPI(
            baudrate=1000000,
            polarity=0,
            phase=0,
            sck=Pin(sck),
            mosi=Pin(mosi),
            miso=Pin(miso),
        )
        self._rst.value(1)
        self._configure()

    # -- low-level register access -----------------------------------------

    def _write_register(self, address, value):
        self._cs.value(0)
        self._spi.write(bytes([(address << 1) & 0x7E, value & 0xFF]))
        self._cs.value(1)

    def _read_register(self, address):
        self._cs.value(0)
        self._spi.write(bytes([((address << 1) & 0x7E) | 0x80]))
        value = self._spi.read(1)
        self._cs.value(1)
        return value[0]

    def _set_bits(self, address, mask):
        self._write_register(address, self._read_register(address) | mask)

    def _clear_bits(self, address, mask):
        self._write_register(address, self._read_register(address) & (~mask & 0xFF))

    # -- setup ---------------------------------------------------------------

    def _configure(self):
        self._write_register(self._REG_COMMAND, self._CMD_RESET)
        self._write_register(self._REG_T_MODE, 0x8D)
        self._write_register(self._REG_T_PRESCALER, 0x3E)
        self._write_register(self._REG_T_RELOAD_L, 30)
        self._write_register(self._REG_T_RELOAD_H, 0)
        self._write_register(self._REG_TX_ASK, 0x40)
        self._write_register(self._REG_MODE, 0x3D)
        self._antenna_on()

    def _antenna_on(self):
        if not self._read_register(self._REG_TX_CONTROL) & 0x03:
            self._set_bits(self._REG_TX_CONTROL, 0x03)

    # -- card communication ---------------------------------------------------

    def _transceive(self, command, send_data):
        wait_irq = 0x30 if command == self._CMD_TRANSCEIVE else 0x10

        self._write_register(self._REG_COM_IRQ_EN, 0x77 | 0x80)
        self._clear_bits(self._REG_COM_IRQ, 0x80)
        self._set_bits(self._REG_FIFO_LEVEL, 0x80)
        self._write_register(self._REG_COMMAND, self._CMD_IDLE)

        for byte in send_data:
            self._write_register(self._REG_FIFO_DATA, byte)
        self._write_register(self._REG_COMMAND, command)
        if command == self._CMD_TRANSCEIVE:
            self._set_bits(self._REG_BIT_FRAMING, 0x80)

        irq = 0
        timeout = 2000
        while timeout:
            irq = self._read_register(self._REG_COM_IRQ)
            timeout -= 1
            if irq & (wait_irq | 0x01):
                break
        self._clear_bits(self._REG_BIT_FRAMING, 0x80)

        if not timeout or self._read_register(self._REG_ERROR) & 0x1B:
            return self.ERROR, [], 0
        if irq & 0x01:
            return self.NO_TAG, [], 0

        received = []
        valid_bits = 0
        if command == self._CMD_TRANSCEIVE:
            fifo_len = self._read_register(self._REG_FIFO_LEVEL)
            last_bits = self._read_register(self._REG_CONTROL) & 0x07
            valid_bits = (fifo_len - 1) * 8 + last_bits if last_bits else fifo_len * 8
            fifo_len = max(1, min(fifo_len, 16))
            received = [self._read_register(self._REG_FIFO_DATA) for _ in range(fifo_len)]

        return self.OK, received, valid_bits

    def _crc(self, data):
        self._clear_bits(self._REG_DIV_IRQ, 0x04)
        self._set_bits(self._REG_FIFO_LEVEL, 0x80)
        for byte in data:
            self._write_register(self._REG_FIFO_DATA, byte)
        self._write_register(self._REG_COMMAND, self._CMD_CALC_CRC)

        timeout = 0xFF
        while timeout and not self._read_register(self._REG_DIV_IRQ) & 0x04:
            timeout -= 1

        return [
            self._read_register(self._REG_CRC_RESULT_L),
            self._read_register(self._REG_CRC_RESULT_M),
        ]

    # -- public API ------------------------------------------------------------

    def request(self, mode):
        self._write_register(self._REG_BIT_FRAMING, 0x07)
        status, _, bits = self._transceive(self._CMD_TRANSCEIVE, [mode])
        if status != self.OK or bits != 0x10:
            return self.ERROR, bits
        return self.OK, bits

    def anticoll(self):
        self._write_register(self._REG_BIT_FRAMING, 0x00)
        status, received, _ = self._transceive(self._CMD_TRANSCEIVE, [0x93, 0x20])
        if status != self.OK or len(received) != 5:
            return self.ERROR, received
        checksum = 0
        for byte in received[:4]:
            checksum ^= byte
        if checksum != received[4]:
            return self.ERROR, received
        return self.OK, received

    def select_tag(self, uid):
        buf = [0x93, 0x70] + list(uid[:5])
        buf += self._crc(buf)
        status, _, bits = self._transceive(self._CMD_TRANSCEIVE, buf)
        return self.OK if status == self.OK and bits == 0x18 else self.ERROR

    def auth(self, mode, block_addr, key, uid):
        data = [mode, block_addr] + list(key) + list(uid[:4])
        return self._transceive(self._CMD_AUTHENT, data)[0]

    def stop_crypto(self):
        self._clear_bits(self._REG_STATUS2, 0x08)

    def read(self, block_addr):
        data = [0x30, block_addr]
        data += self._crc(data)
        status, received, _ = self._transceive(self._CMD_TRANSCEIVE, data)
        return received if status == self.OK else None

    def write(self, block_addr, data):
        req = [0xA0, block_addr]
        req += self._crc(req)
        status, received, bits = self._transceive(self._CMD_TRANSCEIVE, req)
        if status != self.OK or bits != 4 or (received[0] & 0x0F) != 0x0A:
            return self.ERROR

        buf = list(data[:16]) + self._crc(list(data[:16]))
        status, received, bits = self._transceive(self._CMD_TRANSCEIVE, buf)
        if status != self.OK or bits != 4 or (received[0] & 0x0F) != 0x0A:
            return self.ERROR
        return self.OK

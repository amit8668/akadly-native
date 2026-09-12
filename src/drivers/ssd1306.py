# SSD1306 OLED driver for MicroPython (I2C).
#
# Original implementation written for Akadly (native). The command byte
# values below come from the public SSD1306 controller datasheet (Solomon
# Systech) - they are the fixed register/command opcodes the chip itself
# requires to be configured, not creative content, so any correct driver
# for this chip sends the same bytes in essentially the same order.
#
# Public API (kept stable since generated Blocks code calls it directly):
#   SSD1306_I2C(width, height, i2c, addr=0x3C, external_vcc=False)
#   .fill(color) / .text(str, x, y) / .pixel(x, y, color) -> inherited from
#       framebuf.FrameBuffer
#   .show() -> push the framebuffer to the physical display
#   .contrast(value) / .invert(flag) / .poweron() / .poweroff()

from micropython import const
import framebuf

# SSD1306 command opcodes (datasheet section 9, "Command Table").
_SET_DISPLAY_ON_OFF = const(0xAE)  # bit0: 0=off, 1=on
_SET_CLOCK_DIV = const(0xD5)
_SET_MULTIPLEX = const(0xA8)
_SET_DISPLAY_OFFSET = const(0xD3)
_SET_START_LINE = const(0x40)
_SET_CHARGE_PUMP = const(0x8D)
_SET_MEMORY_MODE = const(0x20)
_SET_SEGMENT_REMAP = const(0xA1)
_SET_COM_SCAN_DIR = const(0xC8)
_SET_COM_PINS = const(0xDA)
_SET_CONTRAST = const(0x81)
_SET_PRECHARGE = const(0xD9)
_SET_VCOM_DESELECT = const(0xDB)
_SET_ENTIRE_DISPLAY_RESUME = const(0xA4)
_SET_NORMAL_DISPLAY = const(0xA6)
_SET_INVERT_DISPLAY = const(0xA7)
_SET_COLUMN_ADDR = const(0x21)
_SET_PAGE_ADDR = const(0x22)


class _SSD1306(framebuf.FrameBuffer):
    """Shared framebuffer/init logic; bus-specific writes live in subclasses."""

    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = height // 8
        self.buffer = bytearray(self.pages * width)
        super().__init__(self.buffer, width, height, framebuf.MONO_VLSB)
        self._configure()
        self.poweron()

    def _configure(self):
        self.poweroff()
        self._cmd(_SET_CLOCK_DIV, 0x80)
        self._cmd(_SET_MULTIPLEX, self.height - 1)
        self._cmd(_SET_DISPLAY_OFFSET, 0x00)
        self._cmd(_SET_START_LINE | 0x00)
        self._cmd(_SET_CHARGE_PUMP, 0x10 if self.external_vcc else 0x14)
        self._cmd(_SET_MEMORY_MODE, 0x00)
        self._cmd(_SET_SEGMENT_REMAP | 0x01)
        self._cmd(_SET_COM_SCAN_DIR)
        com_pins = 0x02 if self.height == 32 else 0x12
        self._cmd(_SET_COM_PINS, com_pins)
        self.contrast(0x9F if self.external_vcc else 0xCF)
        self._cmd(_SET_PRECHARGE, 0x22 if self.external_vcc else 0xF1)
        self._cmd(_SET_VCOM_DESELECT, 0x40)
        self._cmd(_SET_ENTIRE_DISPLAY_RESUME)
        self.invert(False)

    def poweroff(self):
        self._cmd(_SET_DISPLAY_ON_OFF | 0x00)

    def poweron(self):
        self._cmd(_SET_DISPLAY_ON_OFF | 0x01)

    def contrast(self, value):
        self._cmd(_SET_CONTRAST, value & 0xFF)

    def invert(self, flag):
        self._cmd(_SET_INVERT_DISPLAY if flag else _SET_NORMAL_DISPLAY)

    def show(self):
        x0, x1 = 0, self.width - 1
        if self.width == 64:
            # 64px-wide panels are wired starting at column 32 on many
            # common modules.
            x0 += 32
            x1 += 32
        self._cmd(_SET_COLUMN_ADDR, x0, x1)
        self._cmd(_SET_PAGE_ADDR, 0, self.pages - 1)
        self._write_framebuffer()

    def _cmd(self, *_bytes):
        raise NotImplementedError

    def _write_framebuffer(self):
        raise NotImplementedError


class SSD1306_I2C(_SSD1306):
    def __init__(self, width, height, i2c, addr=0x3C, external_vcc=False):
        self.i2c = i2c
        self.addr = addr
        # I2C control byte: bit6 (0x40) selects data stream, 0x00 selects a
        # single command byte - required by the chip's I2C command protocol.
        self._cmd_prefix = bytearray([0x00])
        self._data_prefix = bytearray([0x40])
        super().__init__(width, height, external_vcc)

    def _cmd(self, *cmd_bytes):
        self.i2c.writeto(self.addr, self._cmd_prefix + bytearray(cmd_bytes))

    def _write_framebuffer(self):
        self.i2c.writeto(self.addr, self._data_prefix + self.buffer)


class SSD1306_SPI(_SSD1306):
    def __init__(self, width, height, spi, dc, res, cs, external_vcc=False):
        self.spi = spi
        self.dc = dc
        self.res = res
        self.cs = cs
        self.res(1)
        self.res(0)
        self.res(1)
        super().__init__(width, height, external_vcc)

    def _cmd(self, *cmd_bytes):
        self.cs(1)
        self.dc(0)
        self.cs(0)
        self.spi.write(bytearray(cmd_bytes))
        self.cs(1)

    def _write_framebuffer(self):
        self.cs(1)
        self.dc(1)
        self.cs(0)
        self.spi.write(self.buffer)
        self.cs(1)

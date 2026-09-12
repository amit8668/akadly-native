# Minimal MPU6050 accelerometer/gyroscope driver (I2C).
# Register addresses and scale factors are from the public MPU-6050 register
# map datasheet (InvenSense) - not copyrighted, just numeric facts.

_ADDR = 0x68
_PWR_MGMT_1 = 0x6B
_ACCEL_XOUT_H = 0x3B
_GYRO_XOUT_H = 0x43
_ACCEL_SCALE = 16384.0  # LSB per g, default +/-2g range
_GYRO_SCALE = 131.0  # LSB per deg/s, default +/-250 deg/s range


class MPU6050:
    def __init__(self, i2c, addr=_ADDR):
        self.i2c = i2c
        self.addr = addr
        self.i2c.writeto_mem(self.addr, _PWR_MGMT_1, b"\x00")  # wake from sleep

    def _read_word(self, reg):
        data = self.i2c.readfrom_mem(self.addr, reg, 2)
        value = (data[0] << 8) | data[1]
        if value >= 0x8000:
            value -= 0x10000
        return value

    def read_accel(self):
        x = self._read_word(_ACCEL_XOUT_H) / _ACCEL_SCALE
        y = self._read_word(_ACCEL_XOUT_H + 2) / _ACCEL_SCALE
        z = self._read_word(_ACCEL_XOUT_H + 4) / _ACCEL_SCALE
        return x, y, z

    def read_gyro(self):
        x = self._read_word(_GYRO_XOUT_H) / _GYRO_SCALE
        y = self._read_word(_GYRO_XOUT_H + 2) / _GYRO_SCALE
        z = self._read_word(_GYRO_XOUT_H + 4) / _GYRO_SCALE
        return x, y, z

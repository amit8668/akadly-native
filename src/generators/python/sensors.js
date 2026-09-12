import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

pythonGenerator.forBlock['sensor_dht_start'] = function (block, generator) {
  generator.definitions_['import_dht'] = 'import dht';
  generator.definitions_['import_machine_sensors'] = 'import machine';
  const sensorType = block.getFieldValue('TYPE');
  const pin = generator.valueToCode(block, 'PIN', ORDER_ATOMIC) || '0';
  const ctor = sensorType === 'DHT11' ? 'DHT11' : 'DHT22';
  generator.definitions_['dht_sensor'] =
    `dht_sensor = dht.${ctor}(machine.Pin(${pin}))`;
  return '';
};

pythonGenerator.forBlock['sensor_dht_measure'] = function () {
  return 'dht_sensor.measure()\n';
};

pythonGenerator.forBlock['sensor_dht_temperature'] = function (block, generator) {
  return ['dht_sensor.temperature()', ORDER_ATOMIC];
};

pythonGenerator.forBlock['sensor_dht_humidity'] = function (block, generator) {
  return ['dht_sensor.humidity()', ORDER_ATOMIC];
};

// --- Ultrasound (HC-SR04) ---------------------------------------------

pythonGenerator.forBlock['sensor_hcsr04_init'] = function (block, generator) {
  generator.definitions_['import_machine_hcsr04'] = 'import machine, time';
  generator.definitions_['hcsr04_class'] = `
class _HCSR04:
    def __init__(self, trigger_pin, echo_pin, timeout_us=30000):
        self.timeout_us = timeout_us
        self.trigger = machine.Pin(trigger_pin, machine.Pin.OUT)
        self.trigger.value(0)
        self.echo = machine.Pin(echo_pin, machine.Pin.IN)

    def distance_cm(self):
        self.trigger.value(0)
        time.sleep_us(5)
        self.trigger.value(1)
        time.sleep_us(10)
        self.trigger.value(0)
        try:
            pulse_time = machine.time_pulse_us(self.echo, 1, self.timeout_us)
        except OSError:
            return -1
        if pulse_time < 0:
            return -1
        return (pulse_time / 2) / 29.1`;
  const trigger = generator.valueToCode(block, 'TRIGGER', ORDER_ATOMIC) || '0';
  const echo = generator.valueToCode(block, 'ECHO', ORDER_ATOMIC) || '0';
  return `hcsr04_sensor = _HCSR04(${trigger}, ${echo})\n`;
};

pythonGenerator.forBlock['sensor_hcsr04_distance'] = function () {
  return ['hcsr04_sensor.distance_cm()', ORDER_ATOMIC];
};

// --- OneWire (DS18B20) -------------------------------------------------

pythonGenerator.forBlock['sensor_ds18b20_init'] = function (block, generator) {
  generator.definitions_['import_onewire'] = 'import machine, onewire, ds18x20';
  const pin = generator.valueToCode(block, 'PIN', ORDER_ATOMIC) || '0';
  generator.definitions_['ds18b20_bus'] =
    `ds18b20_bus = ds18x20.DS18X20(onewire.OneWire(machine.Pin(${pin})))`;
  return '';
};

pythonGenerator.forBlock['sensor_ds18b20_scan'] = function () {
  return ['ds18b20_bus.scan()', ORDER_ATOMIC];
};

pythonGenerator.forBlock['sensor_ds18b20_convert'] = function () {
  return 'ds18b20_bus.convert_temp()\n';
};

pythonGenerator.forBlock['sensor_ds18b20_read_temp'] = function (block, generator) {
  const rom = generator.valueToCode(block, 'ROM', ORDER_ATOMIC) || 'None';
  return [`ds18b20_bus.read_temp(${rom})`, ORDER_ATOMIC];
};

// --- Inertial Measurement (MPU6050) ------------------------------------

pythonGenerator.forBlock['sensor_mpu6050_init'] = function (block, generator) {
  generator.definitions_['import_machine_mpu'] = 'import machine';
  generator.definitions_['import_mpu6050'] = 'import mpu6050';
  const scl = generator.valueToCode(block, 'SCL', ORDER_ATOMIC) || '22';
  const sda = generator.valueToCode(block, 'SDA', ORDER_ATOMIC) || '21';
  generator.definitions_['mpu6050_i2c'] =
    `mpu6050_i2c = machine.I2C(0, scl=machine.Pin(${scl}), sda=machine.Pin(${sda}))`;
  generator.definitions_['mpu6050_sensor'] = 'mpu6050_sensor = mpu6050.MPU6050(mpu6050_i2c)';
  return '';
};

pythonGenerator.forBlock['sensor_mpu6050_accel'] = function (block) {
  const axis = block.getFieldValue('AXIS');
  const index = { X: 0, Y: 1, Z: 2 }[axis];
  return [`mpu6050_sensor.read_accel()[${index}]`, ORDER_ATOMIC];
};

pythonGenerator.forBlock['sensor_mpu6050_gyro'] = function (block) {
  const axis = block.getFieldValue('AXIS');
  const index = { X: 0, Y: 1, Z: 2 }[axis];
  return [`mpu6050_sensor.read_gyro()[${index}]`, ORDER_ATOMIC];
};

// --- RFID Reader (RC522) ------------------------------------------------

pythonGenerator.forBlock['sensor_rfid_init'] = function (block, generator) {
  generator.definitions_['import_mfrc522'] = 'import mfrc522';
  const sck = generator.valueToCode(block, 'SCK', ORDER_ATOMIC) || '0';
  const mosi = generator.valueToCode(block, 'MOSI', ORDER_ATOMIC) || '0';
  const miso = generator.valueToCode(block, 'MISO', ORDER_ATOMIC) || '0';
  const rst = generator.valueToCode(block, 'RST', ORDER_ATOMIC) || '0';
  const cs = generator.valueToCode(block, 'CS', ORDER_ATOMIC) || '0';
  generator.definitions_['rfid_reader'] =
    `rfid_reader = mfrc522.MFRC522(${sck}, ${mosi}, ${miso}, ${rst}, ${cs})`;
  return '';
};

pythonGenerator.forBlock['sensor_rfid_card_present'] = function () {
  return ['rfid_reader.request(rfid_reader.REQIDL)[0] == rfid_reader.OK', ORDER_ATOMIC];
};

pythonGenerator.forBlock['sensor_rfid_read_uid'] = function (block, generator) {
  generator.definitions_['rfid_read_uid_fn'] = `
def _rfid_read_uid():
    (stat, tag_type) = rfid_reader.request(rfid_reader.REQIDL)
    if stat != rfid_reader.OK:
        return ''
    (stat, raw_uid) = rfid_reader.anticoll()
    if stat != rfid_reader.OK:
        return ''
    return ''.join('{:02X}'.format(b) for b in raw_uid)`;
  return ['_rfid_read_uid()', ORDER_ATOMIC];
};

// --- Rotary Encoder ------------------------------------------------------

pythonGenerator.forBlock['sensor_encoder_init'] = function (block, generator) {
  generator.definitions_['import_machine_encoder'] = 'import machine';
  generator.definitions_['encoder_state'] = 'encoder_position = 0';
  generator.definitions_['encoder_irq_fn'] = `
def _encoder_irq(pin):
    global encoder_position
    a = encoder_pin_a.value()
    b = encoder_pin_b.value()
    encoder_position += 1 if a == b else -1`;
  const pinA = generator.valueToCode(block, 'PIN_A', ORDER_ATOMIC) || '0';
  const pinB = generator.valueToCode(block, 'PIN_B', ORDER_ATOMIC) || '0';
  return (
    `encoder_pin_a = machine.Pin(${pinA}, machine.Pin.IN, machine.Pin.PULL_UP)\n` +
    `encoder_pin_b = machine.Pin(${pinB}, machine.Pin.IN, machine.Pin.PULL_UP)\n` +
    'encoder_pin_a.irq(trigger=machine.Pin.IRQ_RISING | machine.Pin.IRQ_FALLING, handler=_encoder_irq)\n'
  );
};

pythonGenerator.forBlock['sensor_encoder_position'] = function () {
  return ['encoder_position', ORDER_ATOMIC];
};

pythonGenerator.forBlock['sensor_encoder_reset'] = function () {
  return 'encoder_position = 0\n';
};

// --- Anemometer / rain gauge (pulse counters) ----------------------------

function pulseCounterInit(varName, pinName, irqName) {
  return function (block, generator) {
    generator.definitions_['import_machine_pulse'] = 'import machine';
    generator.definitions_[`${varName}_state`] = `${varName} = 0`;
    generator.definitions_[`${irqName}_fn`] = `
def ${irqName}(pin):
    global ${varName}
    ${varName} += 1`;
    const pin = generator.valueToCode(block, 'PIN', ORDER_ATOMIC) || '0';
    return (
      `${pinName} = machine.Pin(${pin}, machine.Pin.IN, machine.Pin.PULL_UP)\n` +
      `${pinName}.irq(trigger=machine.Pin.IRQ_FALLING, handler=${irqName})\n`
    );
  };
}

pythonGenerator.forBlock['sensor_anemometer_init'] = pulseCounterInit(
  'anemometer_count',
  'anemometer_pin',
  '_anemometer_irq'
);
pythonGenerator.forBlock['sensor_anemometer_count'] = function () {
  return ['anemometer_count', ORDER_ATOMIC];
};
pythonGenerator.forBlock['sensor_anemometer_reset'] = function () {
  return 'anemometer_count = 0\n';
};

pythonGenerator.forBlock['sensor_raingauge_init'] = pulseCounterInit(
  'raingauge_count',
  'raingauge_pin',
  '_raingauge_irq'
);
pythonGenerator.forBlock['sensor_raingauge_count'] = function () {
  return ['raingauge_count', ORDER_ATOMIC];
};
pythonGenerator.forBlock['sensor_raingauge_reset'] = function () {
  return 'raingauge_count = 0\n';
};

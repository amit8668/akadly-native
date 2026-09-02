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

import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'sensor_dht_start',
    message0: 'start DHT sensor type %1 on pin %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'TYPE',
        options: [
          ['DHT11', 'DHT11'],
          ['DHT22', 'DHT22'],
        ],
      },
      { type: 'input_value', name: 'PIN', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 305,
    tooltip: 'Set up a DHT11/DHT22 temperature+humidity sensor.',
  },
  {
    type: 'sensor_dht_measure',
    message0: 'update DHT sensor reading',
    previousStatement: null,
    nextStatement: null,
    colour: 305,
    tooltip: 'Take a new reading from the DHT sensor.',
  },
  {
    type: 'sensor_dht_temperature',
    message0: 'DHT temperature (°C)',
    output: 'Number',
    colour: 305,
    tooltip: 'Temperature from the last DHT reading, in Celsius.',
  },
  {
    type: 'sensor_dht_humidity',
    message0: 'DHT humidity (%)',
    output: 'Number',
    colour: 305,
    tooltip: 'Relative humidity from the last DHT reading.',
  },
]);

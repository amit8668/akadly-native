import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'comm_uart_init',
    message0: 'start UART %1 baudrate %2 TX pin %3 RX pin %4',
    args0: [
      { type: 'field_number', name: 'ID', value: 1, min: 0 },
      { type: 'input_value', name: 'BAUDRATE', check: 'Number' },
      { type: 'input_value', name: 'TX', check: 'Number' },
      { type: 'input_value', name: 'RX', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 165,
    tooltip: 'Set up a hardware UART for serial communication.',
  },
  {
    type: 'comm_uart_write',
    message0: 'UART write %1',
    args0: [{ type: 'input_value', name: 'TEXT', check: 'String' }],
    previousStatement: null,
    nextStatement: null,
    colour: 165,
    tooltip: 'Send text out over UART.',
  },
  {
    type: 'comm_uart_read',
    message0: 'UART read available text',
    output: 'String',
    colour: 165,
    tooltip: 'Read whatever data is currently available on UART.',
  },
  {
    type: 'comm_i2c_init',
    message0: 'start I2C %1 SDA pin %2 SCL pin %3',
    args0: [
      { type: 'field_number', name: 'ID', value: 0, min: 0 },
      { type: 'input_value', name: 'SDA', check: 'Number' },
      { type: 'input_value', name: 'SCL', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 165,
    tooltip: 'Set up an I2C bus.',
  },
  {
    type: 'comm_i2c_scan',
    message0: 'I2C scan (list of addresses)',
    output: 'Array',
    colour: 165,
    tooltip: 'Scan the I2C bus and return the addresses found.',
  },
]);

import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'display_oled_init',
    message0: 'start OLED display %1 x %2 SDA pin %3 SCL pin %4',
    args0: [
      { type: 'input_value', name: 'WIDTH', check: 'Number' },
      { type: 'input_value', name: 'HEIGHT', check: 'Number' },
      { type: 'input_value', name: 'SDA', check: 'Number' },
      { type: 'input_value', name: 'SCL', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 285,
    tooltip: 'Set up an SSD1306 I2C OLED display.',
  },
  {
    type: 'display_oled_text',
    message0: 'OLED write %1 at x %2 y %3',
    args0: [
      { type: 'input_value', name: 'TEXT', check: 'String' },
      { type: 'input_value', name: 'X', check: 'Number' },
      { type: 'input_value', name: 'Y', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 285,
    tooltip: 'Draw text into the OLED display buffer.',
  },
  {
    type: 'display_oled_show',
    message0: 'OLED show',
    previousStatement: null,
    nextStatement: null,
    colour: 285,
    tooltip: 'Push the buffer to the physical display.',
  },
  {
    type: 'display_oled_clear',
    message0: 'OLED clear',
    previousStatement: null,
    nextStatement: null,
    colour: 285,
    tooltip: 'Clear the display buffer (call OLED show to apply).',
  },
]);

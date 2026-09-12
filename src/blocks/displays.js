import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'display_oled_init',
    message0: 'start OLED display %1 I2C bus %2 SCL pin %3 SDA pin %4',
    args0: [
      {
        type: 'field_image',
        src: '/media/oled.png',
        width: 55,
        height: 55,
        alt: 'OLED display module',
      },
      { type: 'input_value', name: 'I2C', check: 'Number' },
      { type: 'input_value', name: 'SCL', check: 'Number' },
      { type: 'input_value', name: 'SDA', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 135,
    tooltip: 'Set up an SSD1306 I2C OLED display.',
  },
  {
    type: 'display_oled_text',
    message0: 'OLED write text at x %1 y %2 %3',
    args0: [
      { type: 'input_value', name: 'X', check: 'Number' },
      { type: 'input_value', name: 'Y', check: 'Number' },
      { type: 'input_value', name: 'TEXT', check: 'String' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Draw text into the OLED display buffer.',
  },
  {
    type: 'display_oled_write_value',
    message0: 'OLED write value at x %1 y %2 %3',
    args0: [
      { type: 'input_value', name: 'X', check: 'Number' },
      { type: 'input_value', name: 'Y', check: 'Number' },
      { type: 'input_value', name: 'VALUE', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip:
      'Draw a number into the OLED display buffer - plug a Number directly in, no text conversion needed.',
  },
  {
    type: 'display_oled_fill',
    message0: 'OLED fill display with %1',
    args0: [{ type: 'input_value', name: 'VALUE', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Fill the whole display buffer with 0 (black) or 1 (white).',
  },
  {
    type: 'display_oled_show',
    message0: 'OLED show',
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Push the buffer to the physical display.',
  },
  {
    type: 'display_oled_clear',
    message0: 'OLED clear',
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'Clear the display buffer (call OLED show to apply).',
  },
]);

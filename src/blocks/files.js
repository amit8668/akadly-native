import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'file_open',
    message0: 'open file %1 mode %2',
    args0: [
      { type: 'input_value', name: 'FILENAME', check: 'String' },
      {
        type: 'field_dropdown',
        name: 'MODE',
        options: [
          ['read', 'r'],
          ['write', 'w'],
          ['append', 'a'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 45,
    tooltip: 'Open a file on the device filesystem.',
  },
  {
    type: 'file_write_line',
    message0: 'write line %1 to file',
    args0: [{ type: 'input_value', name: 'TEXT', check: 'String' }],
    previousStatement: null,
    nextStatement: null,
    colour: 45,
    tooltip: 'Write a line of text to the currently open file.',
  },
  {
    type: 'file_read_line',
    message0: 'read line from file',
    output: 'String',
    colour: 45,
    tooltip: 'Read the next line from the currently open file.',
  },
  {
    type: 'file_close',
    message0: 'close file',
    previousStatement: null,
    nextStatement: null,
    colour: 45,
    tooltip: 'Close the currently open file.',
  },
]);

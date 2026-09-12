import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'python_exec',
    message0: 'run Python code %1',
    args0: [{ type: 'input_value', name: 'CODE', check: 'String' }],
    previousStatement: null,
    nextStatement: null,
    colour: 240,
    tooltip:
      'Splice raw Python straight into the generated program - use this for any ' +
      'sensor or library that does not have a dedicated block yet.',
  },
  {
    type: 'python_exec_value',
    message0: 'Python expression %1',
    args0: [{ type: 'input_value', name: 'CODE', check: 'String' }],
    output: null,
    colour: 240,
    tooltip:
      'Splice a raw Python expression in as a value, so its result can be ' +
      'plugged into another block.',
  },
]);

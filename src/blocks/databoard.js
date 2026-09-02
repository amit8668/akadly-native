import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'databoard_plot',
    message0: 'plot %1 = %2',
    args0: [
      { type: 'input_value', name: 'NAME', check: 'String' },
      { type: 'input_value', name: 'VALUE', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 140,
    tooltip: 'Send a named value to the Databoard/IOT dashboard tabs.',
  },
]);

import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'timing_delay',
    message0: 'wait %1 %2',
    args0: [
      { type: 'input_value', name: 'DURATION', check: 'Number' },
      {
        type: 'field_dropdown',
        name: 'UNIT',
        options: [
          ['seconds', 's'],
          ['milliseconds', 'ms'],
          ['microseconds', 'us'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 65,
    tooltip: 'Pause execution for a given duration.',
  },
  {
    type: 'timing_millis',
    message0: 'milliseconds since boot',
    output: 'Number',
    colour: 65,
    tooltip: 'Milliseconds elapsed since the board started running.',
  },
]);

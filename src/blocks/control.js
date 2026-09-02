import * as Blockly from 'blockly/core';

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'control_try_except',
    message0: 'try %1 %2 except (error) %3 %4',
    args0: [
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'TRY' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'CATCH' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 0,
    tooltip: 'Run a block of code, catching any error instead of stopping.',
  },
  {
    type: 'control_rtc_set',
    message0: 'set date/time year %1 month %2 day %3 hour %4 minute %5 second %6',
    args0: [
      { type: 'input_value', name: 'YEAR', check: 'Number' },
      { type: 'input_value', name: 'MONTH', check: 'Number' },
      { type: 'input_value', name: 'DAY', check: 'Number' },
      { type: 'input_value', name: 'HOUR', check: 'Number' },
      { type: 'input_value', name: 'MINUTE', check: 'Number' },
      { type: 'input_value', name: 'SECOND', check: 'Number' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 0,
    inputsInline: false,
    tooltip: "Set the board's real-time clock.",
  },
  {
    type: 'control_rtc_get',
    message0: 'current %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'PART',
        options: [
          ['year', '0'],
          ['month', '1'],
          ['day', '2'],
          ['hour', '4'],
          ['minute', '5'],
          ['second', '6'],
        ],
      },
    ],
    output: 'Number',
    colour: 0,
    tooltip: "Read one part of the board's current date/time.",
  },
]);

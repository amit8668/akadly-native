import * as Blockly from 'blockly/core';

// Original block definitions for digital/analog/PWM pin control.
// Pin numbers are entered as plain numbers (board-specific valid pin lists
// are surfaced separately, via each board's config - see src/boards/).

Blockly.common.defineBlocksWithJsonArray([
    {
      type: 'gpio_digital_write',
      message0: 'set digital pin %1 to %2',
      args0: [
        { type: 'input_value', name: 'PIN', check: 'Number' },
        {
          type: 'field_dropdown',
          name: 'STATE',
          options: [
            ['HIGH', '1'],
            ['LOW', '0'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 195,
      tooltip: 'Drive a digital output pin high or low.',
    },
    {
      type: 'gpio_digital_read',
      message0: 'read digital pin %1',
      args0: [{ type: 'input_value', name: 'PIN', check: 'Number' }],
      output: 'Number',
      colour: 195,
      tooltip: 'Read a digital input pin (0 or 1).',
    },
    {
      type: 'gpio_analog_read',
      message0: 'read analog pin %1',
      args0: [{ type: 'input_value', name: 'PIN', check: 'Number' }],
      output: 'Number',
      colour: 195,
      tooltip: 'Read an analog-capable pin\'s raw ADC value.',
    },
    {
      type: 'gpio_pwm_write',
      message0: 'set PWM pin %1 duty %2 %% at %3 Hz',
      args0: [
        { type: 'input_value', name: 'PIN', check: 'Number' },
        { type: 'input_value', name: 'DUTY', check: 'Number' },
        { type: 'input_value', name: 'FREQ', check: 'Number' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 195,
      tooltip: 'Configure a PWM output (duty as a 0-100 percentage).',
    },
  ]);

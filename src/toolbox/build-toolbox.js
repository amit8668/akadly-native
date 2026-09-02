// Shared category registry: each entry describes one flyout category.
// Board configs (src/boards/*.js) select which of these to include.
// The "standard" categories (logic/loops/math/text/lists/variables/
// functions) use Blockly's own built-in block types - those ship with
// Blockly itself, not written by us, and need no generator code of our own.

const STANDARD_CATEGORIES = [
  {
    kind: 'category',
    name: 'Logic',
    colour: '210',
    contents: [
      { kind: 'block', type: 'controls_if' },
      { kind: 'block', type: 'logic_compare' },
      { kind: 'block', type: 'logic_operation' },
      { kind: 'block', type: 'logic_negate' },
      { kind: 'block', type: 'logic_boolean' },
    ],
  },
  {
    kind: 'category',
    name: 'Loops',
    colour: '120',
    contents: [
      { kind: 'block', type: 'controls_repeat_ext' },
      { kind: 'block', type: 'controls_whileUntil' },
      { kind: 'block', type: 'controls_for' },
    ],
  },
  {
    kind: 'category',
    name: 'Math',
    colour: '230',
    contents: [
      { kind: 'block', type: 'math_number' },
      { kind: 'block', type: 'math_arithmetic' },
      { kind: 'block', type: 'math_single' },
    ],
  },
  {
    kind: 'category',
    name: 'Text',
    colour: '160',
    contents: [
      { kind: 'block', type: 'text' },
      { kind: 'block', type: 'text_join' },
      { kind: 'block', type: 'text_print' },
    ],
  },
  {
    kind: 'category',
    name: 'Lists',
    colour: '260',
    contents: [
      { kind: 'block', type: 'lists_create_with' },
      { kind: 'block', type: 'lists_repeat' },
      { kind: 'block', type: 'lists_length' },
    ],
  },
  { kind: 'category', name: 'Variables', colour: '330', custom: 'VARIABLE' },
  { kind: 'category', name: 'Functions', colour: '290', custom: 'PROCEDURE' },
];

// Our own, original categories - one entry per block file in src/blocks/.
const CUSTOM_CATEGORIES = {
  gpio: {
    kind: 'category',
    name: 'GPIO',
    colour: '195',
    contents: [
      { kind: 'block', type: 'gpio_digital_write' },
      { kind: 'block', type: 'gpio_digital_read' },
      { kind: 'block', type: 'gpio_analog_read' },
      { kind: 'block', type: 'gpio_pwm_write' },
    ],
  },
  timing: {
    kind: 'category',
    name: 'Timing',
    colour: '65',
    contents: [
      { kind: 'block', type: 'timing_delay' },
      { kind: 'block', type: 'timing_millis' },
    ],
  },
};

export function buildToolbox(board) {
  const customContents = board.categories.map((id) => {
    const category = CUSTOM_CATEGORIES[id];
    if (!category) {
      throw new Error(`Unknown toolbox category "${id}" for board "${board.id}"`);
    }
    return category;
  });

  return {
    kind: 'categoryToolbox',
    contents: [...STANDARD_CATEGORIES, ...customContents],
  };
}

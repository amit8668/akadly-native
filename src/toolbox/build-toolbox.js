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
  sensors: {
    kind: 'category',
    name: 'Sensors',
    colour: '305',
    contents: [
      { kind: 'block', type: 'sensor_dht_start' },
      { kind: 'block', type: 'sensor_dht_measure' },
      { kind: 'block', type: 'sensor_dht_temperature' },
      { kind: 'block', type: 'sensor_dht_humidity' },
    ],
  },
  displays: {
    kind: 'category',
    name: 'Displays',
    colour: '285',
    contents: [
      { kind: 'block', type: 'display_oled_init' },
      { kind: 'block', type: 'display_oled_text' },
      { kind: 'block', type: 'display_oled_show' },
      { kind: 'block', type: 'display_oled_clear' },
    ],
  },
  network: {
    kind: 'category',
    name: 'Network',
    colour: '20',
    contents: [
      { kind: 'block', type: 'network_wifi_connect' },
      { kind: 'block', type: 'network_wifi_is_connected' },
      { kind: 'block', type: 'network_wifi_ip' },
      { kind: 'block', type: 'network_http_get' },
      { kind: 'block', type: 'network_http_post' },
    ],
  },
  files: {
    kind: 'category',
    name: 'Files',
    colour: '45',
    contents: [
      { kind: 'block', type: 'file_open' },
      { kind: 'block', type: 'file_write_line' },
      { kind: 'block', type: 'file_read_line' },
      { kind: 'block', type: 'file_close' },
    ],
  },
  control: {
    kind: 'category',
    name: 'Control',
    colour: '0',
    contents: [
      { kind: 'block', type: 'control_try_except' },
      { kind: 'block', type: 'control_rtc_set' },
      { kind: 'block', type: 'control_rtc_get' },
    ],
  },
  communication: {
    kind: 'category',
    name: 'Communication',
    colour: '165',
    contents: [
      { kind: 'block', type: 'comm_uart_init' },
      { kind: 'block', type: 'comm_uart_write' },
      { kind: 'block', type: 'comm_uart_read' },
      { kind: 'block', type: 'comm_i2c_init' },
      { kind: 'block', type: 'comm_i2c_scan' },
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

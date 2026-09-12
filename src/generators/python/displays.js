import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

pythonGenerator.forBlock['display_oled_init'] = function (block, generator) {
  generator.definitions_['import_ssd1306'] = 'import ssd1306';
  generator.definitions_['import_machine_display'] = 'import machine';
  const i2c = generator.valueToCode(block, 'I2C', ORDER_ATOMIC) || '0';
  const scl = generator.valueToCode(block, 'SCL', ORDER_ATOMIC) || '22';
  const sda = generator.valueToCode(block, 'SDA', ORDER_ATOMIC) || '21';
  generator.definitions_['oled_i2c'] =
    `oled_i2c = machine.I2C(${i2c}, scl=machine.Pin(${scl}), sda=machine.Pin(${sda}))`;
  generator.definitions_['oled'] = 'oled = ssd1306.SSD1306_I2C(128, 64, oled_i2c)';
  return '';
};

pythonGenerator.forBlock['display_oled_text'] = function (block, generator) {
  const text = generator.valueToCode(block, 'TEXT', ORDER_ATOMIC) || "''";
  const x = generator.valueToCode(block, 'X', ORDER_ATOMIC) || '0';
  const y = generator.valueToCode(block, 'Y', ORDER_ATOMIC) || '0';
  return `oled.text(str(${text}), ${x}, ${y})\n`;
};

pythonGenerator.forBlock['display_oled_write_value'] = function (block, generator) {
  const value = generator.valueToCode(block, 'VALUE', ORDER_ATOMIC) || '0';
  const x = generator.valueToCode(block, 'X', ORDER_ATOMIC) || '0';
  const y = generator.valueToCode(block, 'Y', ORDER_ATOMIC) || '0';
  return `oled.text(str(${value}), ${x}, ${y})\n`;
};

pythonGenerator.forBlock['display_oled_fill'] = function (block, generator) {
  const value = generator.valueToCode(block, 'VALUE', ORDER_ATOMIC) || '0';
  return `oled.fill(${value})\n`;
};

pythonGenerator.forBlock['display_oled_show'] = function () {
  return 'oled.show()\n';
};

pythonGenerator.forBlock['display_oled_clear'] = function () {
  return 'oled.fill(0)\n';
};

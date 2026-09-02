import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

pythonGenerator.forBlock['gpio_digital_write'] = function (block, generator) {
  generator.definitions_['import_machine'] = 'import machine';
  const pin = generator.valueToCode(block, 'PIN', ORDER_ATOMIC) || '0';
  const state = block.getFieldValue('STATE');
  const varName = `pin_out_${pin.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  generator.definitions_[`pin_${varName}`] =
    `${varName} = machine.Pin(${pin}, machine.Pin.OUT)`;
  return `${varName}.value(${state})\n`;
};

pythonGenerator.forBlock['gpio_digital_read'] = function (block, generator) {
  generator.definitions_['import_machine'] = 'import machine';
  const pin = generator.valueToCode(block, 'PIN', ORDER_ATOMIC) || '0';
  const code = `machine.Pin(${pin}, machine.Pin.IN).value()`;
  return [code, ORDER_ATOMIC];
};

pythonGenerator.forBlock['gpio_analog_read'] = function (block, generator) {
  generator.definitions_['import_machine'] = 'import machine';
  const pin = generator.valueToCode(block, 'PIN', ORDER_ATOMIC) || '0';
  const code = `machine.ADC(machine.Pin(${pin})).read_u16()`;
  return [code, ORDER_ATOMIC];
};

pythonGenerator.forBlock['gpio_pwm_write'] = function (block, generator) {
  generator.definitions_['import_machine'] = 'import machine';
  const pin = generator.valueToCode(block, 'PIN', ORDER_ATOMIC) || '0';
  const duty = generator.valueToCode(block, 'DUTY', ORDER_ATOMIC) || '0';
  const freq = generator.valueToCode(block, 'FREQ', ORDER_ATOMIC) || '1000';
  const varName = `pwm_${pin.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  generator.definitions_[`pwm_${varName}`] =
    `${varName} = machine.PWM(machine.Pin(${pin}))`;
  return (
    `${varName}.freq(${freq})\n` +
    `${varName}.duty_u16(int(65535 * (${duty}) / 100))\n`
  );
};

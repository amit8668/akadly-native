import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

pythonGenerator.forBlock['comm_uart_init'] = function (block, generator) {
  generator.definitions_['import_machine_uart'] = 'import machine';
  const id = block.getFieldValue('ID');
  const baudrate = generator.valueToCode(block, 'BAUDRATE', ORDER_ATOMIC) || '9600';
  const tx = generator.valueToCode(block, 'TX', ORDER_ATOMIC) || '0';
  const rx = generator.valueToCode(block, 'RX', ORDER_ATOMIC) || '0';
  generator.definitions_[`uart_${id}`] =
    `uart_${id} = machine.UART(${id}, baudrate=${baudrate}, tx=machine.Pin(${tx}), rx=machine.Pin(${rx}))`;
  return '';
};

pythonGenerator.forBlock['comm_uart_write'] = function (block, generator) {
  const text = generator.valueToCode(block, 'TEXT', ORDER_ATOMIC) || "''";
  return `uart_1.write(str(${text}))\n`;
};

pythonGenerator.forBlock['comm_uart_read'] = function () {
  return ["(uart_1.read() or b'').decode()", ORDER_ATOMIC];
};

pythonGenerator.forBlock['comm_i2c_init'] = function (block, generator) {
  generator.definitions_['import_machine_i2c'] = 'import machine';
  const id = block.getFieldValue('ID');
  const sda = generator.valueToCode(block, 'SDA', ORDER_ATOMIC) || '21';
  const scl = generator.valueToCode(block, 'SCL', ORDER_ATOMIC) || '22';
  generator.definitions_[`i2c_${id}`] =
    `i2c_${id} = machine.I2C(${id}, sda=machine.Pin(${sda}), scl=machine.Pin(${scl}))`;
  return '';
};

pythonGenerator.forBlock['comm_i2c_scan'] = function () {
  return ['i2c_0.scan()', ORDER_ATOMIC];
};

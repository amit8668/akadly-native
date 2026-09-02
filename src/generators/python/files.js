import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

pythonGenerator.forBlock['file_open'] = function (block, generator) {
  const filename = generator.valueToCode(block, 'FILENAME', ORDER_ATOMIC) || "''";
  const mode = block.getFieldValue('MODE');
  return `current_file = open(${filename}, '${mode}')\n`;
};

pythonGenerator.forBlock['file_write_line'] = function (block, generator) {
  const text = generator.valueToCode(block, 'TEXT', ORDER_ATOMIC) || "''";
  return `current_file.write(str(${text}) + '\\n')\n`;
};

pythonGenerator.forBlock['file_read_line'] = function () {
  return ['current_file.readline()', ORDER_ATOMIC];
};

pythonGenerator.forBlock['file_close'] = function () {
  return 'current_file.close()\n';
};

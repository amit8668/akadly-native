import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

pythonGenerator.forBlock['control_try_except'] = function (block, generator) {
  const tryBranch = generator.statementToCode(block, 'TRY') || generator.INDENT + 'pass\n';
  const catchBranch = generator.statementToCode(block, 'CATCH') || generator.INDENT + 'pass\n';
  return `try:\n${tryBranch}except Exception as error:\n${catchBranch}`;
};

pythonGenerator.forBlock['control_rtc_set'] = function (block, generator) {
  generator.definitions_['import_machine_rtc'] = 'import machine';
  const year = generator.valueToCode(block, 'YEAR', ORDER_ATOMIC) || '2024';
  const month = generator.valueToCode(block, 'MONTH', ORDER_ATOMIC) || '1';
  const day = generator.valueToCode(block, 'DAY', ORDER_ATOMIC) || '1';
  const hour = generator.valueToCode(block, 'HOUR', ORDER_ATOMIC) || '0';
  const minute = generator.valueToCode(block, 'MINUTE', ORDER_ATOMIC) || '0';
  const second = generator.valueToCode(block, 'SECOND', ORDER_ATOMIC) || '0';
  return `machine.RTC().datetime((${year}, ${month}, ${day}, 0, ${hour}, ${minute}, ${second}, 0))\n`;
};

pythonGenerator.forBlock['control_rtc_get'] = function (block, generator) {
  generator.definitions_['import_machine_rtc'] = 'import machine';
  const part = block.getFieldValue('PART');
  return [`machine.RTC().datetime()[${part}]`, ORDER_ATOMIC];
};

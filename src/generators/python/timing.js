import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

pythonGenerator.forBlock['timing_delay'] = function (block, generator) {
  generator.definitions_['import_time'] = 'import time';
  const duration = generator.valueToCode(block, 'DURATION', ORDER_ATOMIC) || '0';
  const unit = block.getFieldValue('UNIT');
  const fn = { s: 'sleep', ms: 'sleep_ms', us: 'sleep_us' }[unit];
  const arg = unit === 's' ? duration : `int(${duration})`;
  return `time.${fn}(${arg})\n`;
};

pythonGenerator.forBlock['timing_millis'] = function (block, generator) {
  generator.definitions_['import_time'] = 'import time';
  return ['time.ticks_ms()', ORDER_ATOMIC];
};

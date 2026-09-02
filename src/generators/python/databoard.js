import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

// Emits a line the Databoard/IOT panels recognize on the wire:
//   #DATA:<name>:<value>
// This is our own simple original protocol - just a print() the panels
// grep for in the live serial stream, no third-party dashboard library.
pythonGenerator.forBlock['databoard_plot'] = function (block, generator) {
  const name = generator.valueToCode(block, 'NAME', ORDER_ATOMIC) || "''";
  const value = generator.valueToCode(block, 'VALUE', ORDER_ATOMIC) || '0';
  return `print('#DATA:' + str(${name}) + ':' + str(${value}))\n`;
};

import { pythonGenerator } from 'blockly/python';

const ORDER_ATOMIC = pythonGenerator.ORDER_ATOMIC;

// Blockly's string generator wraps a text block's content in a quote pair
// (' or ", whichever avoids escaping). Strip exactly that outer pair so the
// code text is spliced in verbatim, not left as a quoted string literal.
function unquote(code) {
  const quote = code[0];
  if ((quote === "'" || quote === '"') && code[code.length - 1] === quote) {
    return code.slice(1, -1);
  }
  return code;
}

pythonGenerator.forBlock['python_exec'] = function (block, generator) {
  const code = generator.valueToCode(block, 'CODE', ORDER_ATOMIC) || "''";
  return unquote(code) + '\n';
};

pythonGenerator.forBlock['python_exec_value'] = function (block, generator) {
  const code = generator.valueToCode(block, 'CODE', ORDER_ATOMIC) || "''";
  return [unquote(code), ORDER_ATOMIC];
};

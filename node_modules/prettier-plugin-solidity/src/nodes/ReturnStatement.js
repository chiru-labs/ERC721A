const {
  doc: {
    builders: { group, indent, line }
  }
} = require('prettier');

const expression = (node, path, print) => {
  if (node.expression) {
    return node.expression.type === 'TupleExpression'
      ? [' ', path.call(print, 'expression')]
      : group(indent([line, path.call(print, 'expression')]));
  }
  return '';
};

const ReturnStatement = {
  print: ({ node, path, print }) => [
    'return',
    expression(node, path, print),
    ';'
  ]
};

module.exports = ReturnStatement;

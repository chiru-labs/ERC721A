const {
  doc: {
    builders: { group, indent, line }
  }
} = require('prettier');

const initialValue = (node, path, print) => {
  if (!node.initialValue) {
    return '';
  }

  if (node.initialValue.type === 'TupleExpression') {
    return [' = ', path.call(print, 'initialValue')];
  }

  return group([' =', indent([line, path.call(print, 'initialValue')])]);
};

const StateVariableDeclaration = {
  print: ({ node, path, print }) => [
    ...path.map(print, 'variables'),
    initialValue(node, path, print),
    ';'
  ]
};

module.exports = StateVariableDeclaration;

const {
  doc: {
    builders: { group }
  }
} = require('prettier');

const printSeparatedList = require('./print-separated-list');

const contents = (node, path, print) =>
  node.components &&
  node.components.length === 1 &&
  node.components[0].type === 'BinaryOperation'
    ? path.map(print, 'components')
    : [printSeparatedList(path.map(print, 'components'))];

const TupleExpression = {
  print: ({ node, path, print }) =>
    group([
      node.isArray ? '[' : '(',
      ...contents(node, path, print),
      node.isArray ? ']' : ')'
    ])
};

module.exports = TupleExpression;

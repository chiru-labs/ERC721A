const {
  doc: {
    builders: { group, indent, line }
  }
} = require('prettier');

const printSeparatedItem = require('./print-separated-item');

const printBody = (node, path, print) =>
  node.body.type === 'Block'
    ? [' ', path.call(print, 'body')]
    : group(indent([line, path.call(print, 'body')]));

const WhileStatement = {
  print: ({ node, path, print }) => [
    group(['while (', printSeparatedItem(path.call(print, 'condition')), ')']),
    printBody(node, path, print)
  ]
};

module.exports = WhileStatement;

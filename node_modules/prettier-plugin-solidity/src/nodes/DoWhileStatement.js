const {
  doc: {
    builders: { group, indent, line }
  }
} = require('prettier');

const printSeparatedItem = require('./print-separated-item');

const printBody = (node, path, print) =>
  node.body.type === 'Block'
    ? [' ', path.call(print, 'body'), ' ']
    : group([indent([line, path.call(print, 'body')]), line]);

const DoWhileStatement = {
  print: ({ node, path, print }) => [
    'do',
    printBody(node, path, print),
    group(['while (', printSeparatedItem(path.call(print, 'condition')), ');'])
  ]
};

module.exports = DoWhileStatement;

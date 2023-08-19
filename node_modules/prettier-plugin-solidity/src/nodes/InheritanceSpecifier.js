const printSeparatedList = require('./print-separated-list');

const printArguments = (node, path, print) =>
  node.arguments && node.arguments.length
    ? ['(', printSeparatedList(path.map(print, 'arguments')), ')']
    : '';

const InheritanceSpecifier = {
  print: ({ node, path, print }) => [
    path.call(print, 'baseName'),
    printArguments(node, path, print)
  ]
};

module.exports = InheritanceSpecifier;

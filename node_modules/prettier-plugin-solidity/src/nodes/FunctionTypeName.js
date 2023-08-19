const {
  doc: {
    builders: { group, indent, line }
  }
} = require('prettier');

const printSeparatedList = require('./print-separated-list');

const returnTypes = (node, path, print) =>
  node.returnTypes.length > 0
    ? [
        line,
        'returns (',
        printSeparatedList(path.map(print, 'returnTypes')),
        ')'
      ]
    : '';

const visibility = (node) =>
  node.visibility && node.visibility !== 'default'
    ? [line, node.visibility]
    : '';

const stateMutability = (node) =>
  node.stateMutability && node.stateMutability !== 'default'
    ? [line, node.stateMutability]
    : '';

const FunctionTypeName = {
  print: ({ node, path, print }) => [
    'function(',
    printSeparatedList(path.map(print, 'parameterTypes')),
    ')',
    indent(
      group([
        visibility(node),
        stateMutability(node),
        returnTypes(node, path, print)
      ])
    )
  ]
};

module.exports = FunctionTypeName;

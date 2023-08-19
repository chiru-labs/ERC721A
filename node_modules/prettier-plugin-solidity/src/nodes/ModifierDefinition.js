const {
  doc: {
    builders: { group, hardline, indent, line }
  }
} = require('prettier');

const printSeparatedList = require('./print-separated-list');

const modifierParameters = (node, path, print) => {
  if (node.parameters && node.parameters.length > 0) {
    return [
      '(',
      printSeparatedList(path.map(print, 'parameters'), {
        separator: [
          ',',
          // To keep consistency any list of parameters will split if it's longer than 2.
          // For more information see:
          // https://github.com/prettier-solidity/prettier-plugin-solidity/issues/256
          node.parameters.length > 2 ? hardline : line
        ]
      }),
      ')'
    ];
  }

  return '()';
};

const virtual = (node) => (node.isVirtual ? [line, 'virtual'] : '');

const override = (node, path, print) => {
  if (!node.override) return '';
  if (node.override.length === 0) return [line, 'override'];
  return [
    line,
    'override(',
    printSeparatedList(path.map(print, 'override')),
    ')'
  ];
};

const body = (node, path, print) =>
  node.isVirtual ? group(path.call(print, 'body')) : path.call(print, 'body');

const ModifierDefinition = {
  print: ({ node, path, print }) => [
    'modifier ',
    node.name,
    modifierParameters(node, path, print),
    group(indent([virtual(node), override(node, path, print)])),
    ' ',
    body(node, path, print)
  ]
};

module.exports = ModifierDefinition;

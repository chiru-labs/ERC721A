const {
  doc: {
    builders: { hardline }
  }
} = require('prettier');

const printSeparatedList = require('./print-separated-list');

const StructDefinition = {
  print: ({ node, path, print }) => [
    'struct ',
    node.name,
    ' {',
    printSeparatedList(path.map(print, 'members'), {
      firstSeparator: hardline,
      separator: [';', hardline],
      lastSeparator: [';', hardline]
    }),
    '}'
  ]
};

module.exports = StructDefinition;

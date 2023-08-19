const {
  doc: {
    builders: { hardline }
  }
} = require('prettier');

const printSeparatedItem = require('./print-separated-item');
const printComments = require('./print-comments');
const printPreservingEmptyLines = require('./print-preserving-empty-lines');

const AssemblyBlock = {
  print: ({ node, options, path, print }) => [
    '{',
    printSeparatedItem(
      [
        printPreservingEmptyLines(path, 'operations', options, print),
        printComments(node, path, options)
      ],
      { firstSeparator: hardline }
    ),
    '}'
  ]
};

module.exports = AssemblyBlock;

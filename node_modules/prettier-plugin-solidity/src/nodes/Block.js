const {
  doc: {
    builders: { hardline, indent }
  }
} = require('prettier');

const printPreservingEmptyLines = require('./print-preserving-empty-lines');
const printComments = require('./print-comments');

const Block = {
  print: ({ node, options, path, print }) =>
    // if block is empty, just return the pair of braces
    node.statements.length === 0 && !node.comments
      ? '{}'
      : [
          '{',
          indent([
            hardline,
            printPreservingEmptyLines(path, 'statements', options, print),
            printComments(node, path, options)
          ]),
          hardline,
          '}'
        ]
};

module.exports = Block;

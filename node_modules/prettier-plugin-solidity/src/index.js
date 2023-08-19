const { handleComments, printComment } = require('./comments');
const massageAstNode = require('./clean');
const loc = require('./loc');
const options = require('./options');
const parse = require('./parser');
const print = require('./printer');

// https://prettier.io/docs/en/plugins.html#languages
// https://github.com/ikatyang/linguist-languages/blob/master/data/Solidity.json
const languages = [
  {
    linguistLanguageId: 237469032,
    name: 'Solidity',
    type: 'programming',
    color: '#AA6746',
    aceMode: 'text',
    tmScope: 'source.solidity',
    extensions: ['.sol'],
    parsers: ['solidity-parse'],
    vscodeLanguageIds: ['solidity']
  }
];

// https://prettier.io/docs/en/plugins.html#parsers
const parser = { astFormat: 'solidity-ast', parse, ...loc };
const parsers = {
  'solidity-parse': parser
};

const canAttachComment = (node) =>
  node.type && node.type !== 'BlockComment' && node.type !== 'LineComment';

// https://prettier.io/docs/en/plugins.html#printers
const printers = {
  'solidity-ast': {
    canAttachComment,
    handleComments: {
      ownLine: handleComments.handleOwnLineComment,
      endOfLine: handleComments.handleEndOfLineComment,
      remaining: handleComments.handleRemainingComment
    },
    isBlockComment: handleComments.isBlockComment,
    massageAstNode,
    print,
    printComment
  }
};

// https://prettier.io/docs/en/plugins.html#defaultoptions
const defaultOptions = {
  bracketSpacing: false,
  tabWidth: 4
};

module.exports = {
  languages,
  parsers,
  printers,
  options,
  defaultOptions
};

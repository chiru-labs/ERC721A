const CATEGORY_GLOBAL = 'Global';
const CATEGORY_COMMON = 'Common';
const CATEGORY_SOLIDITY = 'Solidity';

const options = {
  printWidth: {
    since: '0.0.0',
    category: CATEGORY_GLOBAL,
    type: 'int',
    default: 80,
    description: 'The line length where Prettier will try wrap.',
    range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 }
  },
  tabWidth: {
    type: 'int',
    category: CATEGORY_GLOBAL,
    default: 2,
    description: 'Number of spaces per indentation level.',
    range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 }
  },
  useTabs: {
    since: '1.0.0',
    category: CATEGORY_GLOBAL,
    type: 'boolean',
    default: false,
    description: 'Indent with tabs instead of spaces.'
  },
  bracketSpacing: {
    since: '0.0.0',
    category: CATEGORY_COMMON,
    type: 'boolean',
    default: true,
    description: 'Print spaces between brackets.',
    oppositeDescription: 'Do not print spaces between brackets.'
  },
  singleQuote: {
    since: '0.0.0',
    category: CATEGORY_COMMON,
    type: 'boolean',
    default: false,
    description: 'Use single quotes instead of double quotes.'
  },
  explicitTypes: {
    category: CATEGORY_SOLIDITY,
    type: 'choice',
    default: 'always',
    description: 'Change when type aliases are used.',
    choices: [
      {
        value: 'always',
        description: 'Prefer explicit types (`uint256`, `int256`, etc.)'
      },
      {
        value: 'never',
        description: 'Prefer type aliases (`uint`, `int`, etc.)'
      },
      {
        value: 'preserve',
        description: 'Respect the type used by the developer.'
      }
    ]
  },
  compiler: {
    category: CATEGORY_SOLIDITY,
    type: 'string',
    description:
      'The Solidity compiler version to help us avoid critical errors in format for the wrong version.'
  }
};

module.exports = options;

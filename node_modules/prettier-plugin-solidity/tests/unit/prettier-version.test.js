const path = require('path');

jest.mock('prettier', () => {
  // Require the original module to not be mocked...
  const originalModule = jest.requireActual('prettier');

  return {
    ...originalModule,
    version: '2.2.1'
  };
});

const prettier = require('prettier');

test('should throw if the installed version of prettier is less than v2.3.0', () => {
  const data = 'contract CheckPrettierVersion {}';

  const options = {
    plugins: [path.join(__dirname, '../..')],
    parser: 'solidity-parse'
  };

  expect(() => {
    prettier.format(data, options);
  }).toThrow('>=2.3.0');
});

const genericPrint = require('../../src/printer');

test('given an unknown module type then genericPrint function should throw', () => {
  const mockPath = { getValue: () => ({ type: 'UnknownModule' }) };

  expect(() => {
    genericPrint(mockPath);
  }).toThrow();
});

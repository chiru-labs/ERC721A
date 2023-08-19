const binaryOperatorPrinters = require('../../../src/binary-operator-printers');

test('binary operators printers to match snapshot', () => {
  expect(Object.keys(binaryOperatorPrinters)).toMatchSnapshot();
});

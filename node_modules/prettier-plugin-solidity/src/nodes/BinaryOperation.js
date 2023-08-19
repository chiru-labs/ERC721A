/* eslint-disable consistent-return */
const printers = require('../binary-operator-printers');

const BinaryOperation = {
  print: ({ node, path, print, options }) => {
    const printerKeys = Object.keys(printers);
    for (let i = 0, len = printerKeys.length; i < len; i += 1) {
      if (printers[printerKeys[i]].match(node.operator))
        return printers[printerKeys[i]].print(node, path, print, options);
    }
  }
};

module.exports = BinaryOperation;

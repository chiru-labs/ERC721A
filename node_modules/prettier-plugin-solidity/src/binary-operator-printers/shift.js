const arithmetic = require('./arithmetic');

module.exports = {
  match: (op) => ['<<', '>>'].includes(op),
  print: arithmetic.print
};

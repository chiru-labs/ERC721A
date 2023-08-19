const {
  doc: {
    builders: { group }
  }
} = require('prettier');

const UncheckedStatement = {
  print: ({ path, print }) => group(['unchecked ', path.call(print, 'block')])
};

module.exports = UncheckedStatement;

const {
  doc: {
    builders: { hardline, join }
  }
} = require('prettier');

const AssemblySwitch = {
  print: ({ path, print }) => [
    'switch ',
    path.call(print, 'expression'),
    hardline,
    join(hardline, path.map(print, 'cases'))
  ]
};

module.exports = AssemblySwitch;

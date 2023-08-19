const {
  doc: {
    builders: { join }
  }
} = require('prettier');

const AssemblyFor = {
  print: ({ path, print }) =>
    join(' ', [
      'for',
      path.call(print, 'pre'),
      path.call(print, 'condition'),
      path.call(print, 'post'),
      path.call(print, 'body')
    ])
};

module.exports = AssemblyFor;

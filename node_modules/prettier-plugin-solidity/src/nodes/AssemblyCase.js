const AssemblyCase = {
  print: ({ node, path, print }) => [
    node.default ? 'default' : ['case ', path.call(print, 'value')],
    ' ',
    path.call(print, 'block')
  ]
};

module.exports = AssemblyCase;

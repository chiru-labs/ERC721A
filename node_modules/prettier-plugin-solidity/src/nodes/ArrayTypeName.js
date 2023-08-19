const ArrayTypeName = {
  print: ({ node, path, print }) => [
    path.call(print, 'baseTypeName'),
    '[',
    node.length ? path.call(print, 'length') : '',
    ']'
  ]
};

module.exports = ArrayTypeName;

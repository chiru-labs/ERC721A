const FileLevelConstant = {
  print: ({ node, path, print }) => [
    path.call(print, 'typeName'),
    ' constant ',
    node.name,
    ' = ',
    path.call(print, 'initialValue'),
    ';'
  ]
};

module.exports = FileLevelConstant;

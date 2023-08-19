const UsingForDeclaration = {
  print: ({ node, path, print }) => [
    'using ',
    node.libraryName,
    ' for ',
    node.typeName ? path.call(print, 'typeName') : '*',
    ';'
  ]
};

module.exports = UsingForDeclaration;

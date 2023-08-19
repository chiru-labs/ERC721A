const Mapping = {
  print: ({ path, print }) => [
    'mapping(',
    path.call(print, 'keyType'),
    ' => ',
    path.call(print, 'valueType'),
    ')'
  ]
};

module.exports = Mapping;

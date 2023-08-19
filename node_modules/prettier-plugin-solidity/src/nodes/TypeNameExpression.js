const TypeNameExpression = {
  print: ({ path, print }) => path.call(print, 'typeName')
};

module.exports = TypeNameExpression;

const UnaryOperation = {
  print: ({ node, path, print }) =>
    node.isPrefix
      ? [
          node.operator,
          node.operator === 'delete' ? ' ' : '',
          path.call(print, 'subExpression')
        ]
      : [path.call(print, 'subExpression'), node.operator]
};

module.exports = UnaryOperation;

const BooleanLiteral = {
  print: ({ node }) => (node.value ? 'true' : 'false')
};

module.exports = BooleanLiteral;

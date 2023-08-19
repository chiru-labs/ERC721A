const stateMutability = (node) =>
  node.stateMutability && node.stateMutability.length > 0
    ? [' ', node.stateMutability]
    : '';

const ElementaryTypeName = {
  print: ({ node }) => [node.name, stateMutability(node)]
};

module.exports = ElementaryTypeName;

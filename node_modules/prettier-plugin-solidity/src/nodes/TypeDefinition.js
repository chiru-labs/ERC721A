const TypeDefinition = {
  print: ({ node }) => ['type ', node.name, ' is ', node.definition.name, ';']
};

module.exports = TypeDefinition;

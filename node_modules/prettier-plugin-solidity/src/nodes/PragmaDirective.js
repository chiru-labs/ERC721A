const PragmaDirective = {
  print: ({ node }) => ['pragma ', node.name, ' ', node.value, ';']
};

module.exports = PragmaDirective;

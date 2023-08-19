const {
  doc: {
    builders: { dedent, line }
  }
} = require('prettier');

const LabelDefinition = {
  print: ({ node }) => [dedent(line), node.name, ':']
};

module.exports = LabelDefinition;

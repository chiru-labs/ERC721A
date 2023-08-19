const printSeparatedList = require('./print-separated-list');

const modifierArguments = (node, path, print) => {
  if (node.arguments) {
    // We always print parentheses at this stage because the parser already
    // stripped them in FunctionDefinitions that are not a constructor.
    return node.arguments.length > 0
      ? ['(', printSeparatedList(path.map(print, 'arguments')), ')']
      : '()';
  }

  return '';
};

const ModifierInvocation = {
  print: ({ node, path, print }) => [
    node.name,
    modifierArguments(node, path, print)
  ]
};

module.exports = ModifierInvocation;

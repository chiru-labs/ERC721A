const {
  doc: {
    builders: { group, ifBreak, indent, label, line, softline }
  }
} = require('prettier');

const printSeparatedList = require('./print-separated-list');

const printObject = (node, path, print, options) => [
  '{',
  printSeparatedList(
    path
      .map(print, 'arguments')
      .map((arg, index) => [node.names[index], ': ', arg]),
    {
      firstSeparator: options.bracketSpacing ? line : softline,
      lastSeparator: [options.bracketSpacing ? line : softline, '})']
    }
  )
];

const printArguments = (path, print) =>
  printSeparatedList(path.map(print, 'arguments'), {
    lastSeparator: [softline, ')']
  });

let groupIndex = 0;
const FunctionCall = {
  print: ({ node, path, print, options }) => {
    let expressionDoc = path.call(print, 'expression');
    let argumentsDoc = ')';

    if (node.arguments && node.arguments.length > 0) {
      if (node.names && node.names.length > 0) {
        argumentsDoc = printObject(node, path, print, options);
      } else {
        argumentsDoc = printArguments(path, print);
      }
    }

    // If we are at the end of a MemberAccessChain we should indent the
    // arguments accordingly.
    if (expressionDoc.label === 'MemberAccessChain') {
      expressionDoc = group(expressionDoc.contents, {
        id: `FunctionCall.expression-${groupIndex}`
      });

      groupIndex += 1;

      argumentsDoc = ifBreak(indent(argumentsDoc), argumentsDoc, {
        groupId: expressionDoc.id
      });
      // We wrap the expression in a label in case there is an IndexAccess or
      // a FunctionCall following this IndexAccess.
      return label('MemberAccessChain', [expressionDoc, '(', argumentsDoc]);
    }

    return [expressionDoc, '(', argumentsDoc];
  }
};

module.exports = FunctionCall;

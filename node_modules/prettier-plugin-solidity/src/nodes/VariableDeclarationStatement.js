const {
  doc: {
    builders: { group, ifBreak, indent }
  }
} = require('prettier');

const printSeparatedList = require('./print-separated-list');

const embraceVariables = (doc, embrace) =>
  embrace ? ['(', printSeparatedList(doc), ')'] : doc;

const initialValue = (node, path, print) =>
  node.initialValue ? [' = ', path.call(print, 'initialValue')] : '';

let groupIndex = 0;
const VariableDeclarationStatement = {
  print: ({ node, path, print }) => {
    const startsWithVar =
      node.variables.filter((x) => x && x.typeName).length === 0;

    const declarationDoc = group(
      [
        startsWithVar ? 'var ' : '',
        embraceVariables(
          path.map(print, 'variables'),
          node.variables.length > 1 || startsWithVar
        )
      ],
      { id: `VariableDeclarationStatement.variables-${groupIndex}` }
    );
    groupIndex += 1;
    const initialValueDoc = initialValue(node, path, print);

    return group([
      declarationDoc,
      ifBreak(indent(initialValueDoc), initialValueDoc, {
        groupId: declarationDoc.id
      }),
      node.omitSemicolon ? '' : ';'
    ]);
  }
};

module.exports = VariableDeclarationStatement;

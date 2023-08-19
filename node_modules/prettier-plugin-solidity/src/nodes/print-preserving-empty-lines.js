const {
  doc: {
    builders: { hardline }
  },
  util: { isNextLineEmptyAfterIndex }
} = require('prettier');

function printPreservingEmptyLines(path, key, options, print) {
  const parts = [];
  path.each((childPath) => {
    const node = childPath.getValue();
    const nodeType = node.type;

    if (
      // Avoid adding a hardline at the beginning of the document.
      parts.length !== 0 &&
      // LabelDefinition adds a dedented line so we don't have to prepend a
      // hardline.
      nodeType !== 'LabelDefinition'
    ) {
      parts.push(hardline);
    }

    if (childPath.getName() > 0) {
      if (
        ['ContractDefinition', 'FunctionDefinition'].includes(nodeType) &&
        parts[parts.length - 2] !== hardline
      ) {
        parts.push(hardline);
      }
    }

    parts.push(print(childPath));

    if (
      isNextLineEmptyAfterIndex(
        options.originalText,
        options.locEnd(node) + 1
      ) ||
      nodeType === 'FunctionDefinition'
    ) {
      parts.push(hardline);
    }
  }, key);

  if (parts.length > 1 && parts[parts.length - 1] === hardline) {
    parts.pop();
  }

  return parts;
}

module.exports = printPreservingEmptyLines;

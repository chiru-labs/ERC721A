const {
  doc: {
    builders: { group, line, indent }
  }
} = require('prettier');
const comparison = require('./comparison');

const groupIfNecessaryBuilder = (path) => (doc) => {
  const parentNode = path.getParentNode();
  if (
    parentNode.type === 'BinaryOperation' &&
    !comparison.match(parentNode.operator)
  ) {
    return doc;
  }
  return group(doc);
};

const indentIfNecessaryBuilder = (path) => (doc) => {
  let node = path.getNode();
  for (let i = 0; ; i += 1) {
    const parentNode = path.getParentNode(i);
    if (parentNode.type === 'ReturnStatement') return doc;
    if (
      parentNode.type !== 'BinaryOperation' ||
      comparison.match(parentNode.operator)
    ) {
      return indent(doc);
    }
    if (node === parentNode.right) return doc;
    node = parentNode;
  }
};

module.exports = {
  match: (op) => ['+', '-', '*', '/', '%'].includes(op),
  print: (node, path, print) => {
    const groupIfNecessary = groupIfNecessaryBuilder(path);
    const indentIfNecessary = indentIfNecessaryBuilder(path);

    const right = [node.operator, line, path.call(print, 'right')];
    // If it's a single binary operation, avoid having a small right
    // operand like - 1 on its own line
    const shouldGroup =
      node.left.type !== 'BinaryOperation' &&
      path.getParentNode().type !== 'BinaryOperation';
    return groupIfNecessary([
      path.call(print, 'left'),
      ' ',
      indentIfNecessary(shouldGroup ? group(right) : right)
    ]);
  }
};

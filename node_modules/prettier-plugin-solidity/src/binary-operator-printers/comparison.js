const {
  doc: {
    builders: { group, line, indent }
  }
} = require('prettier');

const indentIfNecessaryBuilder = (path) => (doc) => {
  let node = path.getNode();
  for (let i = 0; ; i += 1) {
    const parentNode = path.getParentNode(i);
    if (parentNode.type === 'ReturnStatement') return doc;
    if (parentNode.type === 'IfStatement') return doc;
    if (parentNode.type === 'ForStatement') return doc;
    if (parentNode.type === 'WhileStatement') return doc;
    if (parentNode.type !== 'BinaryOperation') return indent(doc);
    if (node === parentNode.right) return doc;
    node = parentNode;
  }
};

module.exports = {
  match: (op) => ['<', '>', '<=', '>=', '==', '!='].includes(op),
  print: (node, path, print) => {
    const indentIfNecessary = indentIfNecessaryBuilder(path);

    const right = [node.operator, line, path.call(print, 'right')];
    // If it's a single binary operation, avoid having a small right
    // operand like - 1 on its own line
    const shouldGroup =
      node.left.type !== 'BinaryOperation' &&
      path.getParentNode().type !== 'BinaryOperation';
    return group([
      path.call(print, 'left'),
      ' ',
      indentIfNecessary(shouldGroup ? group(right) : right)
    ]);
  }
};

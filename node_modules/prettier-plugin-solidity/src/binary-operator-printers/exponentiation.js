const {
  doc: {
    builders: { group, ifBreak, indent, softline }
  }
} = require('prettier');

module.exports = {
  match: (op) => op === '**',
  print: (node, path, print) => {
    const right = [
      ifBreak(' ', ''),
      node.operator,
      softline,
      path.call(print, 'right')
    ];
    // If it's a single binary operation, avoid having a small right
    // operand like - 1 on its own line
    const shouldGroup =
      node.left.type !== 'BinaryOperation' &&
      path.getParentNode().type !== 'BinaryOperation';
    return group([
      path.call(print, 'left'),
      indent(shouldGroup ? group(right) : right)
    ]);
  }
};

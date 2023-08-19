const {
  doc: {
    builders: { group, indent, label, softline }
  }
} = require('prettier');

const isEndOfChain = (node, path) => {
  let i = 0;
  let currentNode = node;
  let parentNode = path.getParentNode(i);
  while (
    parentNode &&
    [
      'FunctionCall',
      'IndexAccess',
      'NameValueExpression',
      'MemberAccess'
    ].includes(parentNode.type)
  ) {
    switch (parentNode.type) {
      case 'MemberAccess':
        // If direct ParentNode is a MemberAccess we are not at the end of the
        // chain.
        return false;

      case 'IndexAccess':
        // If direct ParentNode is an IndexAccess and currentNode is not the base
        // then it must be the index in which case it is the end of the chain.
        if (currentNode !== parentNode.base) return true;
        break;

      case 'FunctionCall':
        // If direct ParentNode is a FunctionCall and currentNode is not the
        // expression then it must be and argument in which case it is the end
        // of the chain.
        if (currentNode !== parentNode.expression) return true;
        break;

      default:
        break;
    }

    i += 1;
    currentNode = parentNode;
    parentNode = path.getParentNode(i);
  }
  return true;
};

/**
 * processChain expects the doc[] of the full chain of MemberAccess.
 *
 * It uses the separator label to split the chain into 2 arrays.
 * The first array is the doc[] corresponding to the first element before the
 * first separator.
 * The second array contains the rest of the chain.
 *
 * The second array is grouped and indented, while the first element's
 * formatting logic remains separated.
 *
 * That way the first element can safely split into multiple lines and the rest
 * of the chain will continue its formatting rules as normal.
 *
 * i.e.
 * ```
 * functionCall(arg1, arg2).rest.of.chain
 *
 * functionCall(arg1, arg2)
 *     .long
 *     .rest
 *     .of
 *     .chain
 *
 * functionCall(
 *     arg1,
 *     arg2
 * ).rest.of.chain
 *
 * functionCall(
 *     arg1,
 *     arg2
 * )
 *     .long
 *     .rest
 *     .of
 *     .chain
 * ```
 *
 * NOTE: As described in the examples above, the rest of the chain will be grouped
 * and try to stay in the same line as the end of the first element.
 *
 * @param {doc[]} chain is the full chain of MemberAccess
 * @returns a processed doc[] with the proper grouping and indentation ready to
 * be printed.
 */
const processChain = (chain) => {
  const firstSeparatorIndex = chain.findIndex(
    (element) => element.label === 'separator'
  );
  // The doc[] before the first separator
  const firstExpression = chain.slice(0, firstSeparatorIndex);
  // The doc[] containing the rest of the chain
  const restOfChain = group(indent(chain.slice(firstSeparatorIndex)));

  // We wrap the expression in a label in case there is an IndexAccess or
  // a FunctionCall following this MemberAccess.
  return label('MemberAccessChain', group([firstExpression, restOfChain]));
};

const MemberAccess = {
  print: ({ node, path, print }) => {
    let expressionDoc = path.call(print, 'expression');
    if (Array.isArray(expressionDoc)) {
      expressionDoc = expressionDoc.flat();
    }

    const doc = [
      expressionDoc,
      label('separator', [softline, '.']),
      node.memberName
    ].flat();

    return isEndOfChain(node, path) ? processChain(doc) : doc;
  }
};

module.exports = MemberAccess;

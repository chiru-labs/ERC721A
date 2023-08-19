const {
  util: {
    addLeadingComment,
    addTrailingComment,
    addDanglingComment,
    getNextNonSpaceNonCommentCharacterIndex
  }
} = require('prettier');

function handleContractDefinitionComments(
  text,
  precedingNode,
  enclosingNode,
  followingNode,
  comment,
  options
) {
  if (!enclosingNode || enclosingNode.type !== 'ContractDefinition') {
    return false;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   contract a is abc /* comment */ {}
  // The only workaround I found is to look at the next character to see if
  // it is a {}.
  const nextCharacter = text.charAt(
    getNextNonSpaceNonCommentCharacterIndex(text, comment, options.locEnd)
  );

  // The comment is behind the start of the Block `{}` or behind a base contract
  if (
    (followingNode && followingNode.type === 'InheritanceSpecifier') ||
    nextCharacter === '{'
  ) {
    // In this scenario the comment belongs to a base contract.
    //   contract A is B, /* comment for B */ C /* comment for C */ {}
    if (precedingNode && precedingNode.type === 'InheritanceSpecifier') {
      addTrailingComment(precedingNode, comment);
      return true;
    }

    // In this scenario the comment belongs to the contract's name.
    //   contract A /* comment for A */ is B, C {}
    // TODO: at the moment we prepended it but this should be kept after the name.
    addLeadingComment(enclosingNode, comment);
    return true;
  }

  // When the contract is empty and contain comments.
  // Most likely disabling a linter rule.
  if (enclosingNode.subNodes.length === 0) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

module.exports = handleContractDefinitionComments;

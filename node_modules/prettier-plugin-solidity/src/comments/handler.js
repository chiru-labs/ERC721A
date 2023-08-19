const {
  handleOwnLineComment,
  handleEndOfLineComment,
  handleRemainingComment,
  isBlockComment
} = require('../prettier-comments/language-js/comments');

const handleContractDefinitionComments = require('./handlers/ContractDefinition');

function solidityHandleOwnLineComment(
  comment,
  text,
  options,
  ast,
  isLastComment
) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  const handlerArguments = [
    text,
    precedingNode,
    enclosingNode,
    followingNode,
    comment,
    options
  ];

  if (
    handleContractDefinitionComments(...handlerArguments) ||
    handleOwnLineComment(comment, text, options, ast, isLastComment)
  ) {
    return true;
  }
  return false;
}

function solidityHandleEndOfLineComment(
  comment,
  text,
  options,
  ast,
  isLastComment
) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  const handlerArguments = [
    text,
    precedingNode,
    enclosingNode,
    followingNode,
    comment,
    options
  ];

  if (
    handleContractDefinitionComments(...handlerArguments) ||
    handleEndOfLineComment(comment, text, options, ast, isLastComment)
  ) {
    return true;
  }
  return false;
}

function solidityHandleRemainingComment(
  comment,
  text,
  options,
  ast,
  isLastComment
) {
  const { precedingNode, enclosingNode, followingNode } = comment;
  const handlerArguments = [
    text,
    precedingNode,
    enclosingNode,
    followingNode,
    comment,
    options
  ];

  if (
    handleContractDefinitionComments(...handlerArguments) ||
    handleRemainingComment(comment, text, options, ast, isLastComment)
  ) {
    return true;
  }
  return false;
}

module.exports = {
  handleOwnLineComment: solidityHandleOwnLineComment,
  handleEndOfLineComment: solidityHandleEndOfLineComment,
  handleRemainingComment: solidityHandleRemainingComment,
  isBlockComment
};

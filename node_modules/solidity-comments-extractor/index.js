const DOUBLE_QUOTE_STRING_STATE = 'double-quote-string-state';
const SINGLE_QUOTE_STRING_STATE = 'single-quote-string-state';
const LINE_COMMENT_STATE = 'line-comment-state';
const BLOCK_COMMENT_STATE = 'block-comment-state';
const ETC_STATE = 'etc-state';

function extractComments(str) {
  let state = ETC_STATE;
  let i = 0;
  const comments = [];
  let currentComment = null;

  while (i + 1 < str.length) {
    if (state === ETC_STATE && str[i] === '/' && str[i + 1] === '/') {
      state = LINE_COMMENT_STATE;
      currentComment = {
        type: 'LineComment',
        range: [i]
      };
      i += 2;
      continue;
    }

    if (state === LINE_COMMENT_STATE && str[i] === '\n') {
      state = ETC_STATE;
      currentComment.range.push(i);
      comments.push(currentComment);
      currentComment = null;
      i += 1;
      continue;
    }

    if (state === ETC_STATE && str[i] === '/' && str[i + 1] === '*') {
      state = BLOCK_COMMENT_STATE;
      currentComment = {
        type: 'BlockComment',
        range: [i]
      };
      i += 2;
      continue;
    }

    if (state === BLOCK_COMMENT_STATE && str[i] === '*' && str[i + 1] === '/') {
      state = ETC_STATE;
      currentComment.range.push(i + 2);
      comments.push(currentComment);
      currentComment = null;
      i += 2;
      continue;
    }

    if (state === ETC_STATE && str[i] === '"') {
      state = DOUBLE_QUOTE_STRING_STATE;
      i += 1;
      continue;
    }
    if (
      state === DOUBLE_QUOTE_STRING_STATE &&
      str[i] === '"' &&
      (str[i - 1] !== '\\' || str[i - 2] === '\\') // ignore previous backslash unless it's escaped
    ) {
      state = ETC_STATE;
      i += 1;
      continue;
    }

    if (state === ETC_STATE && str[i] === "'") {
      state = SINGLE_QUOTE_STRING_STATE;
      i += 1;
      continue;
    }
    if (
      state === SINGLE_QUOTE_STRING_STATE &&
      str[i] === "'" &&
      (str[i - 1] !== '\\' || str[i - 2] === '\\') // ignore previous backslash unless it's escaped
    ) {
      state = ETC_STATE;
      i += 1;
      continue;
    }

    i += 1;
  }

  if (currentComment !== null && currentComment.type === 'LineComment') {
    if (str[i] === '\n') {
      currentComment.range.push(str.length - 1);
    } else {
      currentComment.range.push(str.length);
    }
    comments.push(currentComment);
  }

  return comments.map((comment) => {
    const start = comment.range[0] + 2;
    const end =
      comment.type === 'LineComment' ? comment.range[1] : comment.range[1] - 2;
    const raw = str.slice(start, end);

    // removing the leading asterisks from the value is necessary for jsdoc-style comments
    let value = raw;
    if (comment.type === 'BlockComment') {
      value = value
        .split('\n')
        .map((x) => x.replace(/^\s*\*/, ''))
        .join('\n')
        .trimRight();
    }

    return {
      ...comment,
      raw,
      value
    };
  });
}

module.exports = extractComments;

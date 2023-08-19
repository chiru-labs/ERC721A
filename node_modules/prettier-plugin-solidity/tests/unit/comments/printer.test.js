const printComment = require('../../../src/comments/printer');

test('given an unknown comment type then printComment function should throw', () => {
  const mockCommentPath = { getValue: () => ({ type: 'UnknownComment' }) };

  expect(() => {
    printComment(mockCommentPath);
  }).toThrow();
});

# solidity-comments-extractor

Extract comments from Solidity code

## How to

```js
const expect = require('expect');
const extractComments = require('./index');

const code = `
// this is a contract
contract Foo {
}
`;

const comments = extractComments(code);

expect(comments).toEqual([
  {
    range: [1, 22],
    raw: ' this is a contract',
    type: 'LineComment',
    value: ' this is a contract'
  }
]);
```

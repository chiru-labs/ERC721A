# binary-parse-stream

  Painless streaming binary protocol parsers using generators.

## Installation

    npm install binary-parse-stream

## Synchronous

  This module uses the exact same generator interface as [binary-parser](https://github.com/nathan7/binary-parser), which presents a synchronous interface to a generator parser.

## Usage

```javascript
var BinaryParseStream = require('binary-parse-stream')
  , One = BinaryParseStream.One // -1
```

  BinaryParseStream is a TransformStream that consumes buffers and outputs objects on the other end.
  It expects your subclass to implement a `_parse` method that is a generator.
  When your generator yields a number, it'll be fed a buffer of that length from the input.
  If it yields -1, it'll be given the value of the first byte instead of a single-byte buffer.
  When your generator returns, the return value will be pushed to the output side.

## Example

  The following module parses a protocol that consists of a 32-bit unsigned big-endian type parameter, an unsigned 8-bit length parameter, and a buffer of the specified length.
  It outputs `{type, buf}` objects.

```js
var BinaryParseStream = require('binary-parse-stream')
  , inherits = require('util').inherits

module.exports = SillyProtocolParseStream
inherits(SillyProtocolParseStream, BinaryParseStream)
function SillyProtocolParseStream(options) {
  BinaryParseStream.call(this, options)
}
SillyProtocolParseStream.prototype._parse = function*() {
  var type = (yield 4).readUInt32BE(0, true)
    , length = yield -1
    , buf = yield length
  return { type: type, buf: buf }
}
```

  There is also a shorter syntax for when you don't want to explicitly subclass:  `BinaryParseStream.extend(function*())`.


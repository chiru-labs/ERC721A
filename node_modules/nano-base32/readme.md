# Nano-Base32

A small, quick, self-contained implementation of the Base32 encoding/decoding scheme used by the cryptocurrency Nano.

## Installation

```sh
$ yarn add nano-base32
```

or

```sh
$ npm install --save nano-base32
```

## Usage

```js
const nanoBase32 = require('nano-base32')
const hexToArrayBuffer = require('hex-to-array-buffer')
const arrayBufferToHex = require('array-buffer-to-hex')
const blake = require('blakejs')

const pubKey = '0D7471E5D11FADDCE5315C97B23B464184AFA8C4C396DCF219696B2682D0ADF6'
const buffer = new Uint8Array(hexToArrayBuffer(pubKey))

const encoded = nanoBase32.encode(buffer)
// => 15dng9kx49xfumkm4q6qpaxneie6oynebiwpums3ktdd6t3f3dhp

const checksum = blake.blake2b(buffer, null, 5).reverse()
// => Uint8Array [ 33, 233, 215, 36, 38 ]
const checksumEncoded = nanoBase32.encode(checksum)
// => 69nxgb38

const address = `xrb_${encoded}${checksumEncoded}`
// => xrb_15dng9kx49xfumkm4q6qpaxneie6oynebiwpums3ktdd6t3f3dhp69nxgb38

const decoded = nanoBase32.decode(encoded)
const decodedHex = arrayBufferToHex(decoded.buffer).toUpperCase()
// => 0D7471E5D11FADDCE5315C97B23B464184AFA8C4C396DCF219696B2682D0ADF6

const decodedChecksum = nanoBase32.decode(checksumEncoded)
// => Uint8Array [ 33, 233, 215, 36, 38 ]
```

## API

```javascript
/**
 * Decodes a Nano-implementation Base32 encoded string into a Uint8Array
 * @param {string} input A Nano-Base32 encoded string
 * @returns {Uint8Array}
 */
 function decode (input)

/**
 * Encode provided Uint8Array using the Nano-specific Base-32 implementeation.
 * @param {Uint8Array} view Input buffer formatted as a Uint8Array
 * @returns {string}
 */
function encode (view)
 ```

 ## Running Tests
 ```
 $ git clone https://github.com/termhn/node-base32
 $ cd node-base32
 $ yarn install
 $ yarn test
 ```

## Credit
Encoding and decoding algorithms based on:
- [base32-encode](https://github.com/LinusU/base32-encode) - Base32 encoder
- [base32-decode](https://github.com/LinusU/base32-decode) - Base32 decoder

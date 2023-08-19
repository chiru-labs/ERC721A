# SHA-3 for JavaScript

[![Travis CI][3]][4]
[![npm version][5]][6]
[![npm downloads][7]][6]
[![dependencies][8]][9]
[![devDependencies][10]][9]
[![license][11]][12]

A pure JavaScript implementation of the Keccak family of cryptographic hashing algorithms, most notably including Keccak and SHA3.

> :bulb: **Legacy Note:** In previous versions of this library, the `SHA3Hash` object provided a *Keccak* hash, **not** what we
> currently know as a SHA-3 hash. For backwards-compatibility, this object is still exported. However, users are encouraged to
> switch to using the `SHA3` or `Keccak` objects instead, which provide the SHA-3 and Keccak hashing algorithms, respectively.

## Installation

Via `npm`:

```bash
$ npm install sha3
```

Via `yarn`:

```bash
$ yarn add sha3
```

## Usage

You can use this library from Node.js, from web browsers, and/or using ES6 imports.

### Node.js (CommonJS style)

```javascript
// Standard FIPS 202 SHA-3 implementation
const { SHA3 } = require('sha3');

// The Keccak hash function is also available
const { Keccak } = require('sha3');
```

### ES6

```javascript
// Standard FIPS 202 SHA-3 implementation
import { SHA3 } from 'sha3';

// The Keccak hash function is also available
import { Keccak } from 'sha3';
```

### What's in the box

FIPS-compatible interfaces for the following algorithms:

 * `SHA3`: The SHA3 algorithm.
 * `Keccak`: The Keccak algorithm.
 * `SHAKE`: The SHAKE XOF algorithm.

> :bulb: **Legacy Note:** Savvy inspectors may notice that `SHA3Hash` is also provided. Prior to v2.0.0,
> this library only implemented an early version of the SHA3 algorithm. Since then, SHA3 has diverged from
> Keccak and is using a different padding scheme, but for compatibility, this alias is sticking around
> for a bit longer.

### Examples

#### Generating a SHA3-512 hash

```javascript
import { SHA3 } from 'sha3';

const hash = new SHA3(512);

hash.update('foo');
hash.digest('hex');
```

#### Generating a Keccak-256 hash

```javascript
import { Keccak } from 'sha3';

const hash = new Keccak(256);

hash.update('foo');
hash.digest('hex');
```

#### Generating a SHAKE128 hash with 2048 bytes

```javascript
import { SHAKE } from 'sha3';

const hash = new SHAKE(128);

hash.update('foo');
hash.digest({ buffer: Buffer.alloc(2048), format: 'hex' });
```

### API Reference

All hash implementations provided by this library conform to the following API specification.

#### `#constructor([size=512])`

The constructor for each hash (e.g: `Keccak`, `SHA3`), expects the following parameters:

 * `size` (Number): Optional. The size of the hash to create, in bits. If provided, this must be one of `224`, `256`, `384`, or `512`. Defaults to `512`.

##### Example

```javascript
// Construct a new Keccak hash of size 256
const hash = new Keccak(256);
```

#### `#update(data, [encoding='utf8'])`

Updates the hash content with the given data. Returns the hash object itself.

 * `data` (Buffer|string): **Required.** The data to read into the hash.
 * `encoding` (string): **Optional.** The encoding of the given `data`, if of type `string`. Defaults to `'utf8'`.

> :bulb: See [Buffers and Character Encodings][15] for a list of allowed encodings.

##### Example

```javascript
const hash = new Keccak(256);

hash.update('hello');

hash.update('we can also chain these').update('together');
```

#### `#digest([encoding='binary'])`

Digests the hash and returns the result. After calling this function, the hash **may** continue to receive input.

 * `encoding` (string): **Optional.** The encoding to use for the returned digest. Defaults to `'binary'`.

If an `encoding` is provided and is a value other than `'binary'`, then this function returns a `string`.
Otherwise, it returns a `Buffer`.

> :bulb: See [Buffers and Character Encodings][15] for a list of allowed encodings.

##### Example

```javascript
const hash = new Keccak(256);

hash.update('hello');

hash.digest('hex');
// => hash of 'hello' as a hex-encoded string
```

#### `#digest([options={}])`

Digests the hash and returns the result. After calling this function, the hash **may** continue to receive input.

Options include:

 * `buffer` (Buffer): **Optional.** A pre-allocated buffer to fill with output bytes. This is how XOF algorithms like SHAKE can be used to obtain an arbitrary number of hash bytes.
 * `format` (string): **Optional.** The encoding to use for the returned digest. Defaults to `'binary'`. If `buffer` is also provided, this value will passed directly into `Buffer#toString()` on the given buffer.
 * `padding` (byte): **Optional.** Override the padding used to pad the input bytes to the algorithm's block size. Typically this should be omitted, but may be required if building additional cryptographic algorithms on top of this library.

If a `format` is provided and is a value other than `'binary'`, then this function returns a `string`.
Otherwise, it returns a `Buffer`.

##### Example

```javascript
const hash = new Keccak(256);

hash.update('hello');

hash.digest({ buffer: Buffer.alloc(32), format: 'hex' });
// => hash of 'hello' as a hex-encoded string
```

#### `#reset()`

Resets a hash to its initial state.

 * All input buffers are cleared from memory.
 * The hash object can safely be reused to compute another hash.

##### Example

```javascript
const hash = new Keccak(256);

hash.update('hello');
hash.digest();
// => hash of 'hello'

hash.reset();

hash.update('world');
hash.digest();
// => hash of 'world'
```

## Testing

Run `yarn test` for the full test suite.

## Disclaimer

Cryptographic hashes provide **integrity**, but do not provide **authenticity** or **confidentiality**.
Hash functions are one part of the cryptographic ecosystem, alongside other primitives like ciphers and
MACs. If considering this library for the purpose of protecting passwords, you may actually be looking
for a [key derivation function][16], which can provide much better security guarantees for this use case.

## Special Thanks

The following resources were invaluable to this implementation and deserve special thanks
for work well done:

 * [Keccak pseudocode][17]: The Keccak team's excellent pseudo-code and technical descriptions.

 * [mjosaarinen/tiny_sha3][18]: Markku-Juhani O. Saarinen's compact, legible, and hackable implementation.

 * [Phusion][13]: For the initial release and maintenance of this project, and gracious hand-off to Twuni for continued development and maintenance.

[1]: https://keccak.team/keccak.html
[2]: https://www.phusion.nl/
[3]: https://img.shields.io/travis/phusion/node-sha3/master.svg?label=Travis%20CI
[4]: https://travis-ci.org/phusion/node-sha3
[5]: https://img.shields.io/npm/v/sha3.svg
[6]: https://www.npmjs.com/package/sha3
[7]: https://img.shields.io/npm/dt/sha3.svg
[8]: https://img.shields.io/david/phusion/node-sha3.svg
[9]: https://github.com/phusion/node-sha3/blob/master/package.json
[10]: https://img.shields.io/david/dev/phusion/node-sha3.svg
[11]: https://img.shields.io/github/license/phusion/node-sha3.svg
[12]: https://github.com/phusion/node-sha3/blob/master/LICENSE
[13]: https://www.phusion.nl/images/header/pinwheel_logo.svg
[14]: http://codahale.com/how-to-safely-store-a-password/
[15]: https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings
[16]: https://www.npmjs.com/package/pbkdf2
[17]: https://keccak.team/keccak_specs_summary.html
[18]: https://github.com/mjosaarinen/tiny_sha3

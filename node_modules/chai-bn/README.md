# chai-bn

[![NPM Package](https://img.shields.io/npm/v/chai-bn.svg?style=flat-square)](https://www.npmjs.org/package/chai-bn)
[![Build Status](https://travis-ci.com/OpenZeppelin/chai-bn.svg?branch=master)](https://travis-ci.com/OpenZeppelin/chai-bn)

[`Chai`](https://www.chaijs.com/) assertions for comparing arbitrary-precision integers using the [bn.js](https://github.com/indutny/bn.js) library. Forked from [chai-bignumber](https://github.com/asmarques/chai-bignumber), which uses the [bignumber.js](https://github.com/MikeMcl/bignumber.js) library.

## Installation

```bash
npm install --save-dev chai-bn
```

## Usage

```javascript
const chai = require('chai');
const BN = require('bn.js');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));
```

## Assertions

The following assertion methods are provided and will override the existing builtin assertions if the `bignumber` property is set as part of the assertion chain:
- equal/equals/eq
- above/gt/greaterThan
- least/gte
- below/lt/lessThan
- most/lte
- closeTo

A set of additional assertion properties is also provided:
- negative
- zero

Both actual values (the values being asserted) and expected values (the values the actual value is expected to match) can be either instances of `BN`, or strings which can be converted into a valid number. This is a key difference with [chai-bignumber](https://github.com/asmarques/chai-bignumber), which automatically converts JavaScript numbers to `BigNumber` instances for both actual and expected values.

Only BDD style (`expect` or `should`) assertions are supported.

## Examples

Methods:

```javascript
const actual = new BN('100000000000000000').plus(new BN('1'));
const expected = '100000000000000001';

actual.should.be.a.bignumber.that.equals(expected);
expect(actual).to.be.a.bignumber.that.is.at.most(expected);
(new BN('1000')).should.be.a.bignumber.that.is.lessThan('2000');
```

Properties:

```javascript
(new BN('-100')).should.be.a.bignumber.that.is.negative;
expect(new BN('1').sub(new BN('1'))).to.be.a.bignumber.that.is.zero;
```

Some `Chai` properties (e.g. the `that.is` chain) have no effect other than increasing readability, and can be dropped if less verbosity is desired.

## License

[MIT](LICENSE)

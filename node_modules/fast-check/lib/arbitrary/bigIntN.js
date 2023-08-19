"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntN = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const BigIntArbitrary_1 = require("./_internals/BigIntArbitrary");
function bigIntN(n) {
    if (n < 1) {
        throw new Error('fc.bigIntN expects requested number of bits to be superior or equal to 1');
    }
    const min = BigInt(-1) << BigInt(n - 1);
    const max = (BigInt(1) << BigInt(n - 1)) - BigInt(1);
    const arb = new BigIntArbitrary_1.BigIntArbitrary(min, max);
    return (0, Converters_1.convertFromNextWithShrunkOnce)(arb, arb.defaultTarget());
}
exports.bigIntN = bigIntN;

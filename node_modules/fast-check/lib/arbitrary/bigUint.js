"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigUint = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const BigIntArbitrary_1 = require("./_internals/BigIntArbitrary");
function computeDefaultMax() {
    return (BigInt(1) << BigInt(256)) - BigInt(1);
}
function bigUint(constraints) {
    const requestedMax = typeof constraints === 'object' ? constraints.max : constraints;
    const max = requestedMax !== undefined ? requestedMax : computeDefaultMax();
    if (max < 0) {
        throw new Error('fc.bigUint expects max to be greater than or equal to zero');
    }
    const arb = new BigIntArbitrary_1.BigIntArbitrary(BigInt(0), max);
    return (0, Converters_1.convertFromNextWithShrunkOnce)(arb, arb.defaultTarget());
}
exports.bigUint = bigUint;

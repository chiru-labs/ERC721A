"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigInt = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const BigIntArbitrary_1 = require("./_internals/BigIntArbitrary");
function buildCompleteBigIntConstraints(constraints) {
    const DefaultPow = 256;
    const DefaultMin = BigInt(-1) << BigInt(DefaultPow - 1);
    const DefaultMax = (BigInt(1) << BigInt(DefaultPow - 1)) - BigInt(1);
    const min = constraints.min;
    const max = constraints.max;
    return {
        min: min !== undefined ? min : DefaultMin - (max !== undefined && max < BigInt(0) ? max * max : BigInt(0)),
        max: max !== undefined ? max : DefaultMax + (min !== undefined && min > BigInt(0) ? min * min : BigInt(0)),
    };
}
function extractBigIntConstraints(args) {
    if (args[0] === undefined) {
        return {};
    }
    if (args[1] === undefined) {
        const constraints = args[0];
        return constraints;
    }
    return { min: args[0], max: args[1] };
}
function bigInt(...args) {
    const constraints = buildCompleteBigIntConstraints(extractBigIntConstraints(args));
    if (constraints.min > constraints.max) {
        throw new Error('fc.bigInt expects max to be greater than or equal to min');
    }
    const arb = new BigIntArbitrary_1.BigIntArbitrary(constraints.min, constraints.max);
    return (0, Converters_1.convertFromNextWithShrunkOnce)(arb, arb.defaultTarget());
}
exports.bigInt = bigInt;

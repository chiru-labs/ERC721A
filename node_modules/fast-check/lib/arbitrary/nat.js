"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nat = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const IntegerArbitrary_1 = require("./_internals/IntegerArbitrary");
function nat(arg) {
    const max = typeof arg === 'number' ? arg : arg && arg.max !== undefined ? arg.max : 0x7fffffff;
    if (max < 0) {
        throw new Error('fc.nat value should be greater than or equal to 0');
    }
    if (!Number.isInteger(max)) {
        throw new Error('fc.nat maximum value should be an integer');
    }
    const arb = new IntegerArbitrary_1.IntegerArbitrary(0, max);
    return (0, Converters_1.convertFromNextWithShrunkOnce)(arb, arb.defaultTarget());
}
exports.nat = nat;

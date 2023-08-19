"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxSafeInteger = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const IntegerArbitrary_1 = require("./_internals/IntegerArbitrary");
function maxSafeInteger() {
    const arb = new IntegerArbitrary_1.IntegerArbitrary(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    return (0, Converters_1.convertFromNextWithShrunkOnce)(arb, arb.defaultTarget());
}
exports.maxSafeInteger = maxSafeInteger;

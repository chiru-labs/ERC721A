"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxSafeNat = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const IntegerArbitrary_1 = require("./_internals/IntegerArbitrary");
function maxSafeNat() {
    const arb = new IntegerArbitrary_1.IntegerArbitrary(0, Number.MAX_SAFE_INTEGER);
    return (0, Converters_1.convertFromNextWithShrunkOnce)(arb, arb.defaultTarget());
}
exports.maxSafeNat = maxSafeNat;

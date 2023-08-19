"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boxedArbitraryBuilder = void 0;
const Converters_1 = require("../../../check/arbitrary/definition/Converters");
const UnboxedToBoxed_1 = require("../mappers/UnboxedToBoxed");
function boxedArbitraryBuilder(arb) {
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)(arb).map(UnboxedToBoxed_1.unboxedToBoxedMapper, UnboxedToBoxed_1.unboxedToBoxedUnmapper));
}
exports.boxedArbitraryBuilder = boxedArbitraryBuilder;

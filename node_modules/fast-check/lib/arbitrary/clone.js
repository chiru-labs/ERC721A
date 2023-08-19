"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const CloneArbitrary_1 = require("./_internals/CloneArbitrary");
function clone(arb, numValues) {
    return (0, Converters_1.convertFromNext)(new CloneArbitrary_1.CloneArbitrary((0, Converters_1.convertToNext)(arb), numValues));
}
exports.clone = clone;

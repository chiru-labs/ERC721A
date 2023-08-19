"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mixedCase = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const MixedCaseArbitrary_1 = require("./_internals/MixedCaseArbitrary");
function defaultToggleCase(rawChar) {
    const upper = rawChar.toUpperCase();
    if (upper !== rawChar)
        return upper;
    return rawChar.toLowerCase();
}
function mixedCase(stringArb, constraints) {
    if (typeof BigInt === 'undefined') {
        throw new Error(`mixedCase requires BigInt support`);
    }
    const toggleCase = (constraints && constraints.toggleCase) || defaultToggleCase;
    const untoggleAll = constraints && constraints.untoggleAll;
    return (0, Converters_1.convertFromNext)(new MixedCaseArbitrary_1.MixedCaseArbitrary((0, Converters_1.convertToNext)(stringArb), toggleCase, untoggleAll));
}
exports.mixedCase = mixedCase;

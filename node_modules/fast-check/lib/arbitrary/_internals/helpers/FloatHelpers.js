"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexToFloat = exports.floatToIndex = exports.decomposeFloat = exports.EPSILON_32 = exports.MAX_VALUE_32 = exports.MIN_VALUE_32 = void 0;
exports.MIN_VALUE_32 = 2 ** -126 * 2 ** -23;
exports.MAX_VALUE_32 = 2 ** 127 * (1 + (2 ** 23 - 1) / 2 ** 23);
exports.EPSILON_32 = 2 ** -23;
const INDEX_POSITIVE_INFINITY = 2139095040;
const INDEX_NEGATIVE_INFINITY = -2139095041;
function decomposeFloat(f) {
    const maxSignificand = 1 + (2 ** 23 - 1) / 2 ** 23;
    for (let exponent = -126; exponent !== 128; ++exponent) {
        const powExponent = 2 ** exponent;
        const maxForExponent = maxSignificand * powExponent;
        if (Math.abs(f) <= maxForExponent) {
            return { exponent, significand: f / powExponent };
        }
    }
    return { exponent: Number.NaN, significand: Number.NaN };
}
exports.decomposeFloat = decomposeFloat;
function indexInFloatFromDecomp(exponent, significand) {
    if (exponent === -126) {
        return significand * 0x800000;
    }
    return (exponent + 127) * 0x800000 + (significand - 1) * 0x800000;
}
function floatToIndex(f) {
    if (f === Number.POSITIVE_INFINITY) {
        return INDEX_POSITIVE_INFINITY;
    }
    if (f === Number.NEGATIVE_INFINITY) {
        return INDEX_NEGATIVE_INFINITY;
    }
    const decomp = decomposeFloat(f);
    const exponent = decomp.exponent;
    const significand = decomp.significand;
    if (Number.isNaN(exponent) || Number.isNaN(significand) || !Number.isInteger(significand * 0x800000)) {
        return Number.NaN;
    }
    if (f > 0 || (f === 0 && 1 / f === Number.POSITIVE_INFINITY)) {
        return indexInFloatFromDecomp(exponent, significand);
    }
    else {
        return -indexInFloatFromDecomp(exponent, -significand) - 1;
    }
}
exports.floatToIndex = floatToIndex;
function indexToFloat(index) {
    if (index < 0) {
        return -indexToFloat(-index - 1);
    }
    if (index === INDEX_POSITIVE_INFINITY) {
        return Number.POSITIVE_INFINITY;
    }
    if (index < 0x1000000) {
        return index * 2 ** -149;
    }
    const postIndex = index - 0x1000000;
    const exponent = -125 + (postIndex >> 23);
    const significand = 1 + (postIndex & 0x7fffff) / 0x800000;
    return significand * 2 ** exponent;
}
exports.indexToFloat = indexToFloat;

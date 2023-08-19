"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexToDouble = exports.doubleToIndex = exports.decomposeDouble = void 0;
const ArrayInt64_1 = require("./ArrayInt64");
const INDEX_POSITIVE_INFINITY = { sign: 1, data: [2146435072, 0] };
const INDEX_NEGATIVE_INFINITY = { sign: -1, data: [2146435072, 1] };
function decomposeDouble(d) {
    const maxSignificand = 2 - Number.EPSILON;
    for (let exponent = -1022; exponent !== 1024; ++exponent) {
        const powExponent = 2 ** exponent;
        const maxForExponent = maxSignificand * powExponent;
        if (Math.abs(d) <= maxForExponent) {
            return { exponent, significand: d / powExponent };
        }
    }
    return { exponent: Number.NaN, significand: Number.NaN };
}
exports.decomposeDouble = decomposeDouble;
function positiveNumberToInt64(n) {
    return [~~(n / 0x100000000), n >>> 0];
}
function indexInDoubleFromDecomp(exponent, significand) {
    if (exponent === -1022) {
        const rescaledSignificand = significand * 2 ** 52;
        return positiveNumberToInt64(rescaledSignificand);
    }
    const rescaledSignificand = (significand - 1) * 2 ** 52;
    const exponentOnlyHigh = (exponent + 1023) * 2 ** 20;
    const index = positiveNumberToInt64(rescaledSignificand);
    index[0] += exponentOnlyHigh;
    return index;
}
function doubleToIndex(d) {
    if (d === Number.POSITIVE_INFINITY) {
        return (0, ArrayInt64_1.clone64)(INDEX_POSITIVE_INFINITY);
    }
    if (d === Number.NEGATIVE_INFINITY) {
        return (0, ArrayInt64_1.clone64)(INDEX_NEGATIVE_INFINITY);
    }
    const decomp = decomposeDouble(d);
    const exponent = decomp.exponent;
    const significand = decomp.significand;
    if (d > 0 || (d === 0 && 1 / d === Number.POSITIVE_INFINITY)) {
        return { sign: 1, data: indexInDoubleFromDecomp(exponent, significand) };
    }
    else {
        const indexOpposite = indexInDoubleFromDecomp(exponent, -significand);
        if (indexOpposite[1] === 0xffffffff) {
            indexOpposite[0] += 1;
            indexOpposite[1] = 0;
        }
        else {
            indexOpposite[1] += 1;
        }
        return { sign: -1, data: indexOpposite };
    }
}
exports.doubleToIndex = doubleToIndex;
function indexToDouble(index) {
    if (index.sign === -1) {
        const indexOpposite = { sign: 1, data: [index.data[0], index.data[1]] };
        if (indexOpposite.data[1] === 0) {
            indexOpposite.data[0] -= 1;
            indexOpposite.data[1] = 0xffffffff;
        }
        else {
            indexOpposite.data[1] -= 1;
        }
        return -indexToDouble(indexOpposite);
    }
    if ((0, ArrayInt64_1.isEqual64)(index, INDEX_POSITIVE_INFINITY)) {
        return Number.POSITIVE_INFINITY;
    }
    if (index.data[0] < 0x200000) {
        return (index.data[0] * 0x100000000 + index.data[1]) * 2 ** -1074;
    }
    const postIndexHigh = index.data[0] - 0x200000;
    const exponent = -1021 + (postIndexHigh >> 20);
    const significand = 1 + ((postIndexHigh & 0xfffff) * 2 ** 32 + index.data[1]) * Number.EPSILON;
    return significand * 2 ** exponent;
}
exports.indexToDouble = indexToDouble;

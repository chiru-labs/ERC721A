"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doubleNext = void 0;
const ArrayInt64_1 = require("../_internals/helpers/ArrayInt64");
const ArrayInt64Arbitrary_1 = require("../_internals/ArrayInt64Arbitrary");
const DoubleHelpers_1 = require("../_internals/helpers/DoubleHelpers");
const Converters_1 = require("../../check/arbitrary/definition/Converters");
function safeDoubleToIndex(d, constraintsLabel) {
    if (Number.isNaN(d)) {
        throw new Error('fc.doubleNext constraints.' + constraintsLabel + ' must be a 32-bit float');
    }
    return (0, DoubleHelpers_1.doubleToIndex)(d);
}
function unmapperDoubleToIndex(value) {
    if (typeof value !== 'number')
        throw new Error('Unsupported type');
    return (0, DoubleHelpers_1.doubleToIndex)(value);
}
function doubleNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -Number.MAX_VALUE : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? Number.MAX_VALUE : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeDoubleToIndex(min, 'min');
    const maxIndex = safeDoubleToIndex(max, 'max');
    if ((0, ArrayInt64_1.isStrictlySmaller64)(maxIndex, minIndex)) {
        throw new Error('fc.doubleNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, ArrayInt64Arbitrary_1.arrayInt64)(minIndex, maxIndex)).map(DoubleHelpers_1.indexToDouble, unmapperDoubleToIndex));
    }
    const positiveMaxIdx = (0, ArrayInt64_1.isStrictlyPositive64)(maxIndex);
    const minIndexWithNaN = positiveMaxIdx ? minIndex : (0, ArrayInt64_1.substract64)(minIndex, ArrayInt64_1.Unit64);
    const maxIndexWithNaN = positiveMaxIdx ? (0, ArrayInt64_1.add64)(maxIndex, ArrayInt64_1.Unit64) : maxIndex;
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, ArrayInt64Arbitrary_1.arrayInt64)(minIndexWithNaN, maxIndexWithNaN)).map((index) => {
        if ((0, ArrayInt64_1.isStrictlySmaller64)(maxIndex, index) || (0, ArrayInt64_1.isStrictlySmaller64)(index, minIndex))
            return Number.NaN;
        else
            return (0, DoubleHelpers_1.indexToDouble)(index);
    }, (value) => {
        if (typeof value !== 'number')
            throw new Error('Unsupported type');
        if (Number.isNaN(value))
            return !(0, ArrayInt64_1.isEqual64)(maxIndex, maxIndexWithNaN) ? maxIndexWithNaN : minIndexWithNaN;
        return (0, DoubleHelpers_1.doubleToIndex)(value);
    }));
}
exports.doubleNext = doubleNext;

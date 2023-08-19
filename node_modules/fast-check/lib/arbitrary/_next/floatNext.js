"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floatNext = void 0;
const integer_1 = require("../integer");
const FloatHelpers_1 = require("../_internals/helpers/FloatHelpers");
const Converters_1 = require("../../check/arbitrary/definition/Converters");
function safeFloatToIndex(f, constraintsLabel) {
    const conversionTrick = 'you can convert any double to a 32-bit float by using `new Float32Array([myDouble])[0]`';
    const errorMessage = 'fc.floatNext constraints.' + constraintsLabel + ' must be a 32-bit float - ' + conversionTrick;
    if (Number.isNaN(f) || (Number.isFinite(f) && (f < -FloatHelpers_1.MAX_VALUE_32 || f > FloatHelpers_1.MAX_VALUE_32))) {
        throw new Error(errorMessage);
    }
    const index = (0, FloatHelpers_1.floatToIndex)(f);
    if (!Number.isInteger(index)) {
        throw new Error(errorMessage);
    }
    return index;
}
function unmapperFloatToIndex(value) {
    if (typeof value !== 'number')
        throw new Error('Unsupported type');
    return (0, FloatHelpers_1.floatToIndex)(value);
}
function floatNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -FloatHelpers_1.MAX_VALUE_32 : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? FloatHelpers_1.MAX_VALUE_32 : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeFloatToIndex(min, 'min');
    const maxIndex = safeFloatToIndex(max, 'max');
    if (minIndex > maxIndex) {
        throw new Error('fc.floatNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, integer_1.integer)({ min: minIndex, max: maxIndex })).map(FloatHelpers_1.indexToFloat, unmapperFloatToIndex));
    }
    const minIndexWithNaN = maxIndex > 0 ? minIndex : minIndex - 1;
    const maxIndexWithNaN = maxIndex > 0 ? maxIndex + 1 : maxIndex;
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, integer_1.integer)({ min: minIndexWithNaN, max: maxIndexWithNaN })).map((index) => {
        if (index > maxIndex || index < minIndex)
            return Number.NaN;
        else
            return (0, FloatHelpers_1.indexToFloat)(index);
    }, (value) => {
        if (typeof value !== 'number')
            throw new Error('Unsupported type');
        if (Number.isNaN(value))
            return maxIndex !== maxIndexWithNaN ? maxIndexWithNaN : minIndexWithNaN;
        return (0, FloatHelpers_1.floatToIndex)(value);
    }));
}
exports.floatNext = floatNext;

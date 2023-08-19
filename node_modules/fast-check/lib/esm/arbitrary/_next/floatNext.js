import { integer } from '../integer.js';
import { floatToIndex, indexToFloat, MAX_VALUE_32 } from '../_internals/helpers/FloatHelpers.js';
import { convertFromNext, convertToNext } from '../../check/arbitrary/definition/Converters.js';
function safeFloatToIndex(f, constraintsLabel) {
    const conversionTrick = 'you can convert any double to a 32-bit float by using `new Float32Array([myDouble])[0]`';
    const errorMessage = 'fc.floatNext constraints.' + constraintsLabel + ' must be a 32-bit float - ' + conversionTrick;
    if (Number.isNaN(f) || (Number.isFinite(f) && (f < -MAX_VALUE_32 || f > MAX_VALUE_32))) {
        throw new Error(errorMessage);
    }
    const index = floatToIndex(f);
    if (!Number.isInteger(index)) {
        throw new Error(errorMessage);
    }
    return index;
}
function unmapperFloatToIndex(value) {
    if (typeof value !== 'number')
        throw new Error('Unsupported type');
    return floatToIndex(value);
}
export function floatNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -MAX_VALUE_32 : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? MAX_VALUE_32 : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeFloatToIndex(min, 'min');
    const maxIndex = safeFloatToIndex(max, 'max');
    if (minIndex > maxIndex) {
        throw new Error('fc.floatNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return convertFromNext(convertToNext(integer({ min: minIndex, max: maxIndex })).map(indexToFloat, unmapperFloatToIndex));
    }
    const minIndexWithNaN = maxIndex > 0 ? minIndex : minIndex - 1;
    const maxIndexWithNaN = maxIndex > 0 ? maxIndex + 1 : maxIndex;
    return convertFromNext(convertToNext(integer({ min: minIndexWithNaN, max: maxIndexWithNaN })).map((index) => {
        if (index > maxIndex || index < minIndex)
            return Number.NaN;
        else
            return indexToFloat(index);
    }, (value) => {
        if (typeof value !== 'number')
            throw new Error('Unsupported type');
        if (Number.isNaN(value))
            return maxIndex !== maxIndexWithNaN ? maxIndexWithNaN : minIndexWithNaN;
        return floatToIndex(value);
    }));
}

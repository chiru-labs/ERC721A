import { add64, isEqual64, isStrictlyPositive64, isStrictlySmaller64, substract64, Unit64, } from '../_internals/helpers/ArrayInt64.js';
import { arrayInt64 } from '../_internals/ArrayInt64Arbitrary.js';
import { doubleToIndex, indexToDouble } from '../_internals/helpers/DoubleHelpers.js';
import { convertFromNext, convertToNext } from '../../check/arbitrary/definition/Converters.js';
function safeDoubleToIndex(d, constraintsLabel) {
    if (Number.isNaN(d)) {
        throw new Error('fc.doubleNext constraints.' + constraintsLabel + ' must be a 32-bit float');
    }
    return doubleToIndex(d);
}
function unmapperDoubleToIndex(value) {
    if (typeof value !== 'number')
        throw new Error('Unsupported type');
    return doubleToIndex(value);
}
export function doubleNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -Number.MAX_VALUE : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? Number.MAX_VALUE : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeDoubleToIndex(min, 'min');
    const maxIndex = safeDoubleToIndex(max, 'max');
    if (isStrictlySmaller64(maxIndex, minIndex)) {
        throw new Error('fc.doubleNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return convertFromNext(convertToNext(arrayInt64(minIndex, maxIndex)).map(indexToDouble, unmapperDoubleToIndex));
    }
    const positiveMaxIdx = isStrictlyPositive64(maxIndex);
    const minIndexWithNaN = positiveMaxIdx ? minIndex : substract64(minIndex, Unit64);
    const maxIndexWithNaN = positiveMaxIdx ? add64(maxIndex, Unit64) : maxIndex;
    return convertFromNext(convertToNext(arrayInt64(minIndexWithNaN, maxIndexWithNaN)).map((index) => {
        if (isStrictlySmaller64(maxIndex, index) || isStrictlySmaller64(index, minIndex))
            return Number.NaN;
        else
            return indexToDouble(index);
    }, (value) => {
        if (typeof value !== 'number')
            throw new Error('Unsupported type');
        if (Number.isNaN(value))
            return !isEqual64(maxIndex, maxIndexWithNaN) ? maxIndexWithNaN : minIndexWithNaN;
        return doubleToIndex(value);
    }));
}

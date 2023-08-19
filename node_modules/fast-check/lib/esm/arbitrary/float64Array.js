import { double } from './double.js';
import { array } from './array.js';
import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
function toTypedMapper(data) {
    return Float64Array.from(data);
}
function fromTypedUnmapper(value) {
    if (!(value instanceof Float64Array))
        throw new Error('Unexpected type');
    return [...value];
}
export function float64Array(constraints = {}) {
    return convertFromNext(convertToNext(array(double(Object.assign(Object.assign({}, constraints), { next: true })), constraints)).map(toTypedMapper, fromTypedUnmapper));
}

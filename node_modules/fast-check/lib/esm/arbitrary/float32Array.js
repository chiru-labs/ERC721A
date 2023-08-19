import { float } from './float.js';
import { array } from './array.js';
import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
function toTypedMapper(data) {
    return Float32Array.from(data);
}
function fromTypedUnmapper(value) {
    if (!(value instanceof Float32Array))
        throw new Error('Unexpected type');
    return [...value];
}
export function float32Array(constraints = {}) {
    return convertFromNext(convertToNext(array(float(Object.assign(Object.assign({}, constraints), { next: true })), constraints)).map(toTypedMapper, fromTypedUnmapper));
}

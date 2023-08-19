import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { integer } from './integer.js';
function booleanMapper(v) {
    return v === 1;
}
function booleanUnmapper(v) {
    if (typeof v !== 'boolean')
        throw new Error('Unsupported input type');
    return v === true ? 1 : 0;
}
function boolean() {
    return convertFromNext(convertToNext(integer({ min: 0, max: 1 }))
        .map(booleanMapper, booleanUnmapper)
        .noBias());
}
export { boolean };

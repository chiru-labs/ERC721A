import { convertFromNext } from '../check/arbitrary/definition/Converters.js';
import { ConstantArbitrary } from './_internals/ConstantArbitrary.js';
export function constant(value) {
    return convertFromNext(new ConstantArbitrary([value]));
}

import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { CloneArbitrary } from './_internals/CloneArbitrary.js';
function clone(arb, numValues) {
    return convertFromNext(new CloneArbitrary(convertToNext(arb), numValues));
}
export { clone };

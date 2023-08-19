import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { StreamArbitrary } from './_internals/StreamArbitrary.js';
function infiniteStream(arb) {
    return convertFromNext(new StreamArbitrary(convertToNext(arb)));
}
export { infiniteStream };

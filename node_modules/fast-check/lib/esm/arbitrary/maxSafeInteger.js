import { convertFromNextWithShrunkOnce } from '../check/arbitrary/definition/Converters.js';
import { IntegerArbitrary } from './_internals/IntegerArbitrary.js';
export function maxSafeInteger() {
    const arb = new IntegerArbitrary(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

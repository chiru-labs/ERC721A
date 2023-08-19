import { convertFromNextWithShrunkOnce } from '../check/arbitrary/definition/Converters.js';
import { IntegerArbitrary } from './_internals/IntegerArbitrary.js';
export function maxSafeNat() {
    const arb = new IntegerArbitrary(0, Number.MAX_SAFE_INTEGER);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

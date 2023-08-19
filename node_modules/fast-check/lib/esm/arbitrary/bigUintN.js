import { convertFromNextWithShrunkOnce } from '../check/arbitrary/definition/Converters.js';
import { BigIntArbitrary } from './_internals/BigIntArbitrary.js';
export function bigUintN(n) {
    if (n < 0) {
        throw new Error('fc.bigUintN expects requested number of bits to be superior or equal to 0');
    }
    const min = BigInt(0);
    const max = (BigInt(1) << BigInt(n)) - BigInt(1);
    const arb = new BigIntArbitrary(min, max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

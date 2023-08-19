import { convertFromNextWithShrunkOnce } from '../check/arbitrary/definition/Converters.js';
import { IntegerArbitrary } from './_internals/IntegerArbitrary.js';
function nat(arg) {
    const max = typeof arg === 'number' ? arg : arg && arg.max !== undefined ? arg.max : 0x7fffffff;
    if (max < 0) {
        throw new Error('fc.nat value should be greater than or equal to 0');
    }
    if (!Number.isInteger(max)) {
        throw new Error('fc.nat maximum value should be an integer');
    }
    const arb = new IntegerArbitrary(0, max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}
export { nat };

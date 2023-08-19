import { convertFromNext } from '../check/arbitrary/definition/Converters.js';
import { ConstantArbitrary } from './_internals/ConstantArbitrary.js';
function constantFrom(...values) {
    if (values.length === 0) {
        throw new Error('fc.constantFrom expects at least one parameter');
    }
    return convertFromNext(new ConstantArbitrary(values));
}
export { constantFrom };

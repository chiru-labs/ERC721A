import { convertFromNext } from '../check/arbitrary/definition/Converters.js';
import { SubarrayArbitrary } from './_internals/SubarrayArbitrary.js';
function subarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return convertFromNext(new SubarrayArbitrary(originalArray, true, args[0], args[1]));
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return convertFromNext(new SubarrayArbitrary(originalArray, true, minLength, maxLength));
}
export { subarray };

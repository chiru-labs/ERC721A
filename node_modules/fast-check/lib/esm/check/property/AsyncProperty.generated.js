import { genericTuple } from '../../arbitrary/genericTuple.js';
import { convertFromNextAsyncPropertyWithHooks } from './ConvertersProperty.js';
import { AsyncProperty } from './AsyncProperty.generic.js';
import { AlwaysShrinkableArbitrary } from '../../arbitrary/_internals/AlwaysShrinkableArbitrary.js';
import { convertFromNext, convertToNext } from '../arbitrary/definition/Converters.js';
function asyncProperty(...args) {
    if (args.length < 2)
        throw new Error('asyncProperty expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return convertFromNextAsyncPropertyWithHooks(new AsyncProperty(genericTuple(arbs.map(arb => convertFromNext(new AlwaysShrinkableArbitrary(convertToNext(arb))))), t => p(...t)));
}
export { asyncProperty };

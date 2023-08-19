import { genericTuple } from '../../arbitrary/genericTuple.js';
import { convertFromNextPropertyWithHooks } from './ConvertersProperty.js';
import { Property } from './Property.generic.js';
import { AlwaysShrinkableArbitrary } from '../../arbitrary/_internals/AlwaysShrinkableArbitrary.js';
import { convertFromNext, convertToNext } from '../arbitrary/definition/Converters.js';
function property(...args) {
    if (args.length < 2)
        throw new Error('property expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return convertFromNextPropertyWithHooks(new Property(genericTuple(arbs.map(arb => convertFromNext(new AlwaysShrinkableArbitrary(convertToNext(arb))))), t => p(...t)));
}
export { property };

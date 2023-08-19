import { convertFromNext, convertToNext } from '../../../check/arbitrary/definition/Converters.js';
import { unboxedToBoxedMapper, unboxedToBoxedUnmapper } from '../mappers/UnboxedToBoxed.js';
export function boxedArbitraryBuilder(arb) {
    return convertFromNext(convertToNext(arb).map(unboxedToBoxedMapper, unboxedToBoxedUnmapper));
}

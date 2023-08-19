import { integer } from './integer.js';
import { typedIntArrayArbitraryArbitraryBuilder, } from './_internals/builders/TypedIntArrayArbitraryBuilder.js';
export function int16Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, -32768, 32767, Int16Array, integer);
}

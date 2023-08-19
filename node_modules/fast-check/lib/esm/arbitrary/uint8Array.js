import { integer } from './integer.js';
import { typedIntArrayArbitraryArbitraryBuilder, } from './_internals/builders/TypedIntArrayArbitraryBuilder.js';
export function uint8Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, 0, 255, Uint8Array, integer);
}

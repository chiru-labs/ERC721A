import { integer } from './integer.js';
import { typedIntArrayArbitraryArbitraryBuilder, } from './_internals/builders/TypedIntArrayArbitraryBuilder.js';
export function uint8ClampedArray(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, 0, 255, Uint8ClampedArray, integer);
}

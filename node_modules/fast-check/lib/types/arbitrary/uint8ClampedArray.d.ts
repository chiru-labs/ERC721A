import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { IntArrayConstraints } from './_internals/builders/TypedIntArrayArbitraryBuilder';
/**
 * For Uint8ClampedArray
 * @remarks Since 2.9.0
 * @public
 */
export declare function uint8ClampedArray(constraints?: IntArrayConstraints): Arbitrary<Uint8ClampedArray>;
export { IntArrayConstraints };

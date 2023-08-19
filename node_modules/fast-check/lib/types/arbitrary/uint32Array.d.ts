import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { IntArrayConstraints } from './_internals/builders/TypedIntArrayArbitraryBuilder';
/**
 * For Uint32Array
 * @remarks Since 2.9.0
 * @public
 */
export declare function uint32Array(constraints?: IntArrayConstraints): Arbitrary<Uint32Array>;
export { IntArrayConstraints };

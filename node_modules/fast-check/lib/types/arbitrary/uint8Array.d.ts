import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { IntArrayConstraints } from './_internals/builders/TypedIntArrayArbitraryBuilder';
/**
 * For Uint8Array
 * @remarks Since 2.9.0
 * @public
 */
export declare function uint8Array(constraints?: IntArrayConstraints): Arbitrary<Uint8Array>;
export { IntArrayConstraints };

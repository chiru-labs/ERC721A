import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { IntArrayConstraints } from './_internals/builders/TypedIntArrayArbitraryBuilder';
/**
 * For Uint16Array
 * @remarks Since 2.9.0
 * @public
 */
export declare function uint16Array(constraints?: IntArrayConstraints): Arbitrary<Uint16Array>;
export { IntArrayConstraints };

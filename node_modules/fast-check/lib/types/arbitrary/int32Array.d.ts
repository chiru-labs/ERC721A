import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { IntArrayConstraints } from './_internals/builders/TypedIntArrayArbitraryBuilder';
/**
 * For Int32Array
 * @remarks Since 2.9.0
 * @public
 */
export declare function int32Array(constraints?: IntArrayConstraints): Arbitrary<Int32Array>;
export { IntArrayConstraints };

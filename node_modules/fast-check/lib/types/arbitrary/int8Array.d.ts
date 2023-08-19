import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { IntArrayConstraints } from './_internals/builders/TypedIntArrayArbitraryBuilder';
/**
 * For Int8Array
 * @remarks Since 2.9.0
 * @public
 */
export declare function int8Array(constraints?: IntArrayConstraints): Arbitrary<Int8Array>;
export { IntArrayConstraints };

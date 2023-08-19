import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For single unicode characters - any of the code points defined in the unicode standard
 *
 * WARNING: Generated values can have a length greater than 1.
 *
 * {@link https://tc39.github.io/ecma262/#sec-utf16encoding}
 *
 * @remarks Since 0.0.11
 * @public
 */
export declare function fullUnicode(): Arbitrary<string>;

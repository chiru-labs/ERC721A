import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { StringSharedConstraints } from './_internals/helpers/StringConstraintsExtractor';
export { StringSharedConstraints } from './_internals/helpers/StringConstraintsExtractor';
/**
 * For strings of {@link unicode}
 * @remarks Since 0.0.11
 * @public
 */
declare function unicodeString(): Arbitrary<string>;
/**
 * For strings of {@link unicode}
 *
 * @param maxLength - Upper bound of the generated string length
 *
 * @deprecated
 * Superceded by `fc.unicodeString({maxLength})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 0.0.11
 * @public
 */
declare function unicodeString(maxLength: number): Arbitrary<string>;
/**
 * For strings of {@link unicode}
 *
 * @param minLength - Lower bound of the generated string length
 * @param maxLength - Upper bound of the generated string length
 *
 * @deprecated
 * Superceded by `fc.unicodeString({minLength, maxLength})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 0.0.11
 * @public
 */
declare function unicodeString(minLength: number, maxLength: number): Arbitrary<string>;
/**
 * For strings of {@link unicode}
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 2.4.0
 * @public
 */
declare function unicodeString(constraints: StringSharedConstraints): Arbitrary<string>;
export { unicodeString };

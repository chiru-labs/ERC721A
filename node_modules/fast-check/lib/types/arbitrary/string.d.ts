import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { StringSharedConstraints } from './_internals/helpers/StringConstraintsExtractor';
export { StringSharedConstraints } from './_internals/helpers/StringConstraintsExtractor';
/**
 * For strings of {@link char}
 * @remarks Since 0.0.1
 * @public
 */
declare function string(): Arbitrary<string>;
/**
 * For strings of {@link char}
 *
 * @param maxLength - Upper bound of the generated string length
 *
 * @deprecated
 * Superceded by `fc.string({maxLength})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 0.0.1
 * @public
 */
declare function string(maxLength: number): Arbitrary<string>;
/**
 * For strings of {@link char}
 *
 * @param minLength - Lower bound of the generated string length
 * @param maxLength - Upper bound of the generated string length
 *
 * @deprecated
 * Superceded by `fc.string({minLength, maxLength})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 0.0.11
 * @public
 */
declare function string(minLength: number, maxLength: number): Arbitrary<string>;
/**
 * For strings of {@link char}
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 2.4.0
 * @public
 */
declare function string(constraints: StringSharedConstraints): Arbitrary<string>;
export { string };

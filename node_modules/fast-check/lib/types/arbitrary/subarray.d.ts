import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * Constraints to be applied on {@link subarray}
 * @remarks Since 2.4.0
 * @public
 */
export interface SubarrayConstraints {
    /**
     * Lower bound of the generated subarray size (included)
     * @defaultValue 0
     * @remarks Since 2.4.0
     */
    minLength?: number;
    /**
     * Upper bound of the generated subarray size (included)
     * @defaultValue The length of the original array itself
     * @remarks Since 2.4.0
     */
    maxLength?: number;
}
/**
 * For subarrays of `originalArray` (keeps ordering)
 *
 * @param originalArray - Original array
 *
 * @remarks Since 1.5.0
 * @public
 */
declare function subarray<T>(originalArray: T[]): Arbitrary<T[]>;
/**
 * For subarrays of `originalArray` (keeps ordering)
 *
 * @param originalArray - Original array
 * @param minLength - Lower bound of the generated array size
 * @param maxLength - Upper bound of the generated array size
 *
 * @deprecated
 * Superceded by `fc.subarray(originalArray, {minLength, maxLength})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 1.5.0
 * @public
 */
declare function subarray<T>(originalArray: T[], minLength: number, maxLength: number): Arbitrary<T[]>;
/**
 * For subarrays of `originalArray` (keeps ordering)
 *
 * @param originalArray - Original array
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 2.4.0
 * @public
 */
declare function subarray<T>(originalArray: T[], constraints: SubarrayConstraints): Arbitrary<T[]>;
export { subarray };

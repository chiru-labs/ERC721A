import { Arbitrary } from '../../check/arbitrary/definition/Arbitrary';
/**
 * Constraints to be applied on {@link floatNext}
 * @remarks Since 2.8.0
 * @public
 */
export interface FloatNextConstraints {
    /**
     * Lower bound for the generated 32-bit floats (included)
     * @defaultValue Number.NEGATIVE_INFINITY, -3.4028234663852886e+38 when noDefaultInfinity is true
     * @remarks Since 2.8.0
     */
    min?: number;
    /**
     * Upper bound for the generated 32-bit floats (included)
     * @defaultValue Number.POSITIVE_INFINITY, 3.4028234663852886e+38 when noDefaultInfinity is true
     * @remarks Since 2.8.0
     */
    max?: number;
    /**
     * By default, lower and upper bounds are -infinity and +infinity.
     * By setting noDefaultInfinity to true, you move those defaults to minimal and maximal finite values.
     * @defaultValue false
     * @remarks Since 2.8.0
     */
    noDefaultInfinity?: boolean;
    /**
     * When set to true, no more Number.NaN can be generated.
     * @defaultValue false
     * @remarks Since 2.8.0
     */
    noNaN?: boolean;
}
/**
 * For 32-bit floating point numbers:
 * - sign: 1 bit
 * - significand: 23 bits
 * - exponent: 8 bits
 *
 * The smallest non-zero value (in absolute value) that can be represented by such float is: 2 ** -126 * 2 ** -23.
 * And the largest one is: 2 ** 127 * (1 + (2 ** 23 - 1) / 2 ** 23).
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @public
 */
export declare function floatNext(constraints?: FloatNextConstraints): Arbitrary<number>;

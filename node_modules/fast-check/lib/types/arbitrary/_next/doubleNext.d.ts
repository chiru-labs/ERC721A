import { Arbitrary } from '../../check/arbitrary/definition/Arbitrary';
/**
 * Constraints to be applied on {@link doubleNext}
 * @remarks Since 2.8.1
 * @public
 */
export interface DoubleNextConstraints {
    /**
     * Lower bound for the generated 64-bit floats (included)
     * @defaultValue Number.NEGATIVE_INFINITY, -1.7976931348623157e+308 when noDefaultInfinity is true
     * @remarks Since 2.8.0
     */
    min?: number;
    /**
     * Upper bound for the generated 64-bit floats (included)
     * @defaultValue Number.POSITIVE_INFINITY, 1.7976931348623157e+308 when noDefaultInfinity is true
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
 * For 64-bit floating point numbers:
 * - sign: 1 bit
 * - significand: 52 bits
 * - exponent: 11 bits
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @public
 */
export declare function doubleNext(constraints?: DoubleNextConstraints): Arbitrary<number>;

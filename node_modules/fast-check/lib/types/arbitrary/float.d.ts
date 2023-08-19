import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { FloatNextConstraints } from './_next/floatNext';
/**
 * Constraints to be applied on {@link float}
 * @remarks Since 2.6.0
 * @public
 */
export declare type FloatConstraints = {
    /**
     * Enable new version of fc.float
     * @remarks Since 2.8.0
     */
    next?: false;
    /**
     * Lower bound for the generated floats (included)
     * @remarks Since 2.6.0
     */
    min?: number;
    /**
     * Upper bound for the generated floats (excluded)
     * @remarks Since 2.6.0
     */
    max?: number;
} | ({
    /**
     * Enable new version of fc.float
     * @remarks Since 2.8.0
     */
    next: true;
} & FloatNextConstraints);
/**
 * For floating point numbers between 0.0 (included) and 1.0 (excluded) - accuracy of `1 / 2**24`
 * @remarks Since 0.0.6
 * @public
 */
declare function float(): Arbitrary<number>;
/**
 * For floating point numbers between 0.0 (included) and max (excluded) - accuracy of `max / 2**24`
 *
 * @param max - Upper bound of the generated floating point
 *
 * @deprecated
 * Superceded by `fc.float({max})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 1.0.0
 * @public
 */
declare function float(max: number): Arbitrary<number>;
/**
 * For floating point numbers between min (included) and max (excluded) - accuracy of `(max - min) / 2**24`
 *
 * @param min - Lower bound of the generated floating point
 * @param max - Upper bound of the generated floating point
 *
 * @remarks You may prefer to use `fc.float({min, max})` instead.
 * @remarks Since 1.0.0
 * @public
 */
declare function float(min: number, max: number): Arbitrary<number>;
/**
 * For floating point numbers in range defined by constraints - accuracy of `(max - min) / 2**24`
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 2.6.0
 * @public
 */
declare function float(constraints: FloatConstraints): Arbitrary<number>;
export { float };

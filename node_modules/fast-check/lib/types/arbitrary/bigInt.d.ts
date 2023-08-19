import { ArbitraryWithContextualShrink } from '../check/arbitrary/definition/ArbitraryWithContextualShrink';
/**
 * Constraints to be applied on {@link bigInt}
 * @remarks Since 2.6.0
 * @public
 */
export interface BigIntConstraints {
    /**
     * Lower bound for the generated bigints (eg.: -5n, 0n, BigInt(Number.MIN_SAFE_INTEGER))
     * @remarks Since 2.6.0
     */
    min?: bigint;
    /**
     * Upper bound for the generated bigints (eg.: -2n, 2147483647n, BigInt(Number.MAX_SAFE_INTEGER))
     * @remarks Since 2.6.0
     */
    max?: bigint;
}
/**
 * For bigint
 * @remarks Since 1.9.0
 * @public
 */
declare function bigInt(): ArbitraryWithContextualShrink<bigint>;
/**
 * For bigint between min (included) and max (included)
 *
 * @param min - Lower bound for the generated bigints (eg.: -5n, 0n, BigInt(Number.MIN_SAFE_INTEGER))
 * @param max - Upper bound for the generated bigints (eg.: -2n, 2147483647n, BigInt(Number.MAX_SAFE_INTEGER))
 *
 * @remarks Since 1.9.0
 * @public
 */
declare function bigInt(min: bigint, max: bigint): ArbitraryWithContextualShrink<bigint>;
/**
 * For bigint between min (included) and max (included)
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 2.6.0
 * @public
 */
declare function bigInt(constraints: BigIntConstraints): ArbitraryWithContextualShrink<bigint>;
export { bigInt };

import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For tuples produced by the provided `arbs`
 *
 * @param arbs - Ordered list of arbitraries
 *
 * @deprecated Switch to {@link tuple} instead
 * @remarks Since 1.0.0
 * @public
 */
export declare function genericTuple<Ts extends unknown[]>(arbs: {
    [K in keyof Ts]: Arbitrary<Ts[K]>;
}): Arbitrary<Ts>;

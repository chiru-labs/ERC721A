import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For pure functions
 *
 * @param arb - Arbitrary responsible to produce the values
 *
 * @remarks Since 1.6.0
 * @public
 */
export declare function func<TArgs extends any[], TOut>(arb: Arbitrary<TOut>): Arbitrary<(...args: TArgs) => TOut>;

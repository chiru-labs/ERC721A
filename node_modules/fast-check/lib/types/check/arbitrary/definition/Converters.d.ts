import { Arbitrary } from './Arbitrary';
import { ArbitraryWithContextualShrink } from './ArbitraryWithContextualShrink';
import { NextArbitrary } from './NextArbitrary';
/**
 * Convert an instance of NextArbitrary to an instance of Arbitrary
 * @param arb - The instance to be converted
 * @remarks Since 2.15.0
 * @public
 */
export declare function convertFromNext<T>(arb: NextArbitrary<T>): Arbitrary<T>;
/**
 * Convert an instance of NextArbitrary to an instance of ArbitraryWithContextualShrink
 * @param arb - The instance to be converted
 * @param legacyShrunkOnceContext - Default context to be returned when shrunk once
 * @remarks Since 2.15.0
 * @public
 */
export declare function convertFromNextWithShrunkOnce<T>(arb: NextArbitrary<T>, legacyShrunkOnceContext: unknown): ArbitraryWithContextualShrink<T>;
/**
 * Convert an instance of Arbitrary to an instance of NextArbitrary
 * @param arb - The instance to be converted
 * @remarks Since 2.15.0
 * @public
 */
export declare function convertToNext<T>(arb: Arbitrary<T>): NextArbitrary<T>;

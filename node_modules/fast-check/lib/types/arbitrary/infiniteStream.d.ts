import { Stream } from '../stream/Stream';
import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * Produce an infinite stream of values
 *
 * WARNING: Requires Object.assign
 *
 * @param arb - Arbitrary used to generate the values
 *
 * @remarks Since 1.8.0
 * @public
 */
declare function infiniteStream<T>(arb: Arbitrary<T>): Arbitrary<Stream<T>>;
export { infiniteStream };

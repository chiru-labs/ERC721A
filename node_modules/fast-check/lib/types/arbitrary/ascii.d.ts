import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For single ascii characters - char code between 0x00 (included) and 0x7f (included)
 * @remarks Since 0.0.1
 * @public
 */
export declare function ascii(): Arbitrary<string>;

import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For single unicode characters defined in the BMP plan - char code between 0x0000 (included) and 0xffff (included) and without the range 0xd800 to 0xdfff (surrogate pair characters)
 * @remarks Since 0.0.11
 * @public
 */
export declare function unicode(): Arbitrary<string>;

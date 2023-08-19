import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For UUID of a given version (in v1 to v5)
 *
 * According to {@link https://tools.ietf.org/html/rfc4122 | RFC 4122}
 *
 * No mixed case, only lower case digits (0-9a-f)
 *
 * @remarks Since 1.17.0
 * @public
 */
export declare function uuidV(versionNumber: 1 | 2 | 3 | 4 | 5): Arbitrary<string>;

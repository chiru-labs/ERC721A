import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
/**
 * For UUID from v1 to v5
 *
 * According to {@link https://tools.ietf.org/html/rfc4122 | RFC 4122}
 *
 * No mixed case, only lower case digits (0-9a-f)
 *
 * @remarks Since 1.17.0
 * @public
 */
export declare function uuid(): Arbitrary<string>;

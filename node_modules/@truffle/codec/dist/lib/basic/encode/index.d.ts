import type * as Format from "../../format";
/**
 * Handles encoding of basic types; yes the input type is broader than
 * it should be but it's hard to fix this without causing other problems,
 * sorry!
 * @Category Encoding (low-level)
 */
export declare function encodeBasic(input: Format.Values.Value): Uint8Array;

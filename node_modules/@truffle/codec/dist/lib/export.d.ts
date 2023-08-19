import type * as Format from "./format";
import type { LogDecoding, ReturndataDecoding } from "./types";
import { ResultInspector, unsafeNativize } from "./format/utils/inspect";
export { ResultInspector, unsafeNativize };
declare type NumberFormatter = (n: BigInt) => any;
/**
 * Options for the nativize function.
 */
export interface NativizeOptions {
    /**
     * This is a function that is used to describe how to format
     * integer values.  It should take as input the number as a BigInt.
     * By default, it's the identity function (i.e., it formats the numbers
     * as BigInts), but by setting it you could instead format numbers as
     * a BN, BigNumber, string, etc.
     */
    numberFormatter?: NumberFormatter;
    /**
     * The format for the nativized result.  Currently the only supported
     * format is "ethers", which nativizes things in a way compatible with how
     * Ethers decodes values.  This format is quite limited, but more may be
     * added in the future.  There is also the separate function
     * [[Format.Utils.Inspect.unsafeNativize|unsafeNativize]], although that is,
     * as noted, unsafe.
     */
    format?: "ethers";
}
/**
 * This function is similar to
 * [[Format.Utils.Inspect.unsafeNativize|unsafeNativize]], but is intended to
 * be safe, and also allows for different output formats.  The only currently
 * supported format is "ethers", which is intended to match the way that
 * Truffle Contract currently returns values (based on the Ethers decoder).  As
 * such, it only handles ABI types, and in addition does not handle the types
 * fixed, ufixed, or function.  Note that in these cases it returns `undefined`
 * rather than throwing, as we want this function to be used in contexts where
 * it had better not throw.  It also does not handle circularities, for similar
 * reasons.
 *
 * To handle numeric types, this function takes an optional numberFormatter
 * option that tells it how to handle numbers; this function should take a
 * BigInt as input.  By default, this function will be the identity, and so
 * numbers will be represented as BigInts.
 *
 * Note that this function begins by calling abify, so out-of-range enums (that
 * aren't so out-of-range as to be padding errors) will not return `undefined`.
 * Out-of-range booleans similarly will return true rather than `undefined`.
 * However, other range errors may return `undefined`; this may technically be a
 * slight incompatibility with existing behavior, but should not be relevant
 * except in quite unusual cases.
 *
 * In order to match the behavior for tuples, tuples will be transformed into
 * arrays, but named entries will additionally be keyed by name.  Moreover,
 * indexed variables of reference type will be nativized to an undecoded hex
 * string.
 */
export declare function nativize(result: Format.Values.Result, options?: NativizeOptions): any;
/**
 * This function is similar to [[nativize]], but takes
 * a [[ReturndataDecoding]].  If there's only one returned value, it
 * will be run through compatibleNativize but otherwise unaltered;
 * otherwise the results will be put in an object.
 *
 * Note that if the ReturndataDecoding is not a [[ReturnDecoding]],
 * this will just return `undefined`.
 */
export declare function nativizeReturn(decoding: ReturndataDecoding, options?: NativizeOptions): any;
/**
 * This function is similar to [[compatibleNativize]], but takes
 * a [[LogDecoding]], and puts the results in an object.  Note
 * that this does not return the entire event info, but just the
 * `args` for the event.
 */
export declare function nativizeEventArgs(decoding: LogDecoding, options?: NativizeOptions): any;

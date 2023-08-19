import BN from "bn.js";
import Big from "big.js";
import type * as Format from "./format";
/**
 * @param bytes - undefined | string | number | BN | Uint8Array | Big
 * @return {BN}
 */
export declare function toBN(bytes: undefined | string | number | BN | Uint8Array | Big): BN;
/**
 * @param bytes - Uint8Array
 * @return {BN}
 */
export declare function toSignedBN(bytes: Uint8Array): BN;
export declare function toBigInt(value: BN): BigInt;
export declare function toBig(value: BN | number): Big;
/**
 * @param bytes - Uint8Array | BN
 * @param padLength - number - minimum desired byte length (left-pad with zeroes)
 * @param padRight - boolean - causes padding to occur on right instead of left
 * @return {string}
 */
export declare function toHexString(bytes: Uint8Array | BN, padLength?: number, padRight?: boolean): string;
export declare function toBytes(data: BN | string | number | Big, length?: number): Uint8Array;
export declare function shiftBigUp(value: Big, decimalPlaces: number): Big;
export declare function shiftBigDown(value: Big, decimalPlaces: number): Big;
export declare function countDecimalPlaces(value: Big): number;
export declare function cleanBool(result: Format.Values.ElementaryResult): Format.Values.ElementaryResult;

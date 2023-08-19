import * as Format from "./format";
import type { CalldataDecoding, LogDecoding, ReturndataDecoding } from "./types";
/** @category ABIfication */
export declare function abifyType(dataType: Format.Types.Type, userDefinedTypes?: Format.Types.TypesById): Format.Types.AbiType | undefined;
/** @category ABIfication */
export declare function abifyResult(result: Format.Values.Result, userDefinedTypes?: Format.Types.TypesById): Format.Values.AbiResult | undefined;
/** @category ABIfication */
export declare function abifyCalldataDecoding(decoding: CalldataDecoding, userDefinedTypes: Format.Types.TypesById): CalldataDecoding;
/** @category ABIfication */
export declare function abifyLogDecoding(decoding: LogDecoding, userDefinedTypes: Format.Types.TypesById): LogDecoding;
/** @category ABIfication */
export declare function abifyReturndataDecoding(decoding: ReturndataDecoding, userDefinedTypes: Format.Types.TypesById): ReturndataDecoding;

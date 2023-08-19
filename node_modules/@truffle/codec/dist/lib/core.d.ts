import * as Ast from "./ast";
import * as AbiData from "./abi-data";
import type * as Pointer from "./pointer";
import type { DecoderRequest, CalldataDecoding, ReturndataDecoding, LogDecoding, LogOptions } from "./types";
import * as Evm from "./evm";
import type * as Format from "./format";
/**
 * @Category Decoding
 */
export declare function decodeVariable(definition: Ast.AstNode, pointer: Pointer.DataPointer, info: Evm.EvmInfo, compilationId: string): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
/**
 * @Category Decoding
 */
export declare function decodeCalldata(info: Evm.EvmInfo, isConstructor?: boolean): Generator<DecoderRequest, CalldataDecoding, Uint8Array>;
/**
 * @Category Decoding
 */
export declare function decodeEvent(info: Evm.EvmInfo, address: string, options?: LogOptions): Generator<DecoderRequest, LogDecoding[], Uint8Array>;
/**
 * If there are multiple possibilities, they're always returned in
 * the order: return, revert, returnmessage, failure, empty, bytecode, unknownbytecode
 * Moreover, within "revert", builtin ones are put above custom ones
 * @Category Decoding
 */
export declare function decodeReturndata(info: Evm.EvmInfo, successAllocation: AbiData.Allocate.ReturndataAllocation | null, //null here must be explicit
status?: boolean, //you can pass this to indicate that you know the status,
id?: string): Generator<DecoderRequest, ReturndataDecoding[], Uint8Array>;
/**
 * Decodes the return data from a failed call.
 *
 * @param returndata The returned data, as a Uint8Array.
 * @return An array of possible decodings.  At the moment it's
 *   impossible for there to be more than one.  (If the call didn't actually
 *   fail, or failed in a nonstandard way, you may get no decodings at all, though!)
 *
 *   Decodings can either be decodings of revert messages, or decodings
 *   indicating that there was no revert message.  If somehow both were to be
 *   possible, they'd go in that order, although as mentioned, there (at least
 *   currently) isn't any way for that to occur.
 * @Category Decoding convenience
 */
export declare function decodeRevert(returndata: Uint8Array): ReturndataDecoding[];

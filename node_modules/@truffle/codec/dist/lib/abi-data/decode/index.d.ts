/**
 * @protected
 *
 * @packageDocumentation
 */
import * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest, DecoderOptions } from "../../types";
import * as Evm from "../../evm";
export declare function decodeAbi(dataType: Format.Types.Type, pointer: Pointer.AbiDataPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeAbiReferenceByAddress(dataType: Format.Types.ReferenceType | Format.Types.TupleType, pointer: Pointer.AbiDataPointer | Pointer.StackFormPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeAbiReferenceStatic(dataType: Format.Types.ReferenceType | Format.Types.TupleType, pointer: Pointer.AbiDataPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;

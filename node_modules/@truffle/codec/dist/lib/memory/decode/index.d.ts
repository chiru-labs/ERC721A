/**
 * @protected
 *
 * @packageDocumentation
 */
import * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest, DecoderOptions } from "../../types";
import * as Evm from "../../evm";
export declare function decodeMemory(dataType: Format.Types.Type, pointer: Pointer.MemoryPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeMemoryReferenceByAddress(dataType: Format.Types.ReferenceType, pointer: Pointer.DataPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;

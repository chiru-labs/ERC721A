/**
 * @protected
 *
 * @packageDocumentation
 */
import * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest } from "../../types";
import * as Evm from "../../evm";
export declare function decodeStorage(dataType: Format.Types.Type, pointer: Pointer.StoragePointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeStorageReferenceByAddress(dataType: Format.Types.ReferenceType, pointer: Pointer.DataPointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeStorageReference(dataType: Format.Types.ReferenceType, pointer: Pointer.StoragePointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;

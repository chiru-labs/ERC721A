/**
 * @protected
 *
 * @packageDocumentation
 */
import * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest } from "../../types";
import * as Evm from "../../evm";
export declare function decodeStack(dataType: Format.Types.Type, pointer: Pointer.StackPointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeLiteral(dataType: Format.Types.Type, pointer: Pointer.StackLiteralPointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;

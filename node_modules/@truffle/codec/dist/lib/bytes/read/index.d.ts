import * as Evm from "../../evm";
import type * as Pointer from "../../pointer";
import type { DecoderRequest } from "../../types";
export declare function readCode(pointer: Pointer.CodePointer, state: Evm.EvmState): Generator<DecoderRequest, Uint8Array, Uint8Array>;
export declare function readBytes(pointer: Pointer.BytesPointer, state: Evm.EvmState): Uint8Array;

/**
 * @protected
 *
 * @packageDocumentation
 */
import type * as Storage from "../types";
import type { DecoderRequest } from "../../types";
import * as Evm from "../../evm";
import type * as Pointer from "../../pointer";
export declare function readSlot(storage: Evm.WordMapping, slot: Storage.Slot): Generator<DecoderRequest, Uint8Array, Uint8Array>;
export declare function readStorage(pointer: Pointer.StoragePointer, state: Evm.EvmState): Generator<DecoderRequest, Uint8Array, Uint8Array>;

import * as Pointer from "./pointer";
import type { DecoderRequest } from "./types";
import * as Evm from "./evm";
export default function read(pointer: Pointer.DataPointer, state: Evm.EvmState): Generator<DecoderRequest, Uint8Array, Uint8Array>;

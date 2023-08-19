import * as Evm from "../../evm";
import type * as Pointer from "../../pointer";
export declare function readStack(pointer: Pointer.StackPointer, state: Evm.EvmState): Uint8Array;
export declare function readStackLiteral(pointer: Pointer.StackLiteralPointer): Uint8Array;

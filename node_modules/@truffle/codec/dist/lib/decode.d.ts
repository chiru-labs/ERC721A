import * as Format from "./format";
import type * as Pointer from "./pointer";
import type * as Evm from "./evm";
import type { DecoderRequest, DecoderOptions } from "./types";
export default function decode(dataType: Format.Types.Type, pointer: Pointer.DataPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;

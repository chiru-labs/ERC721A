import * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest, DecoderOptions } from "../../types";
import type * as Evm from "../../evm";
export declare function decodeTopic(dataType: Format.Types.Type, pointer: Pointer.EventTopicPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;

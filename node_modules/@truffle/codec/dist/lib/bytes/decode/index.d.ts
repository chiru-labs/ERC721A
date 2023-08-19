import type * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest, DecoderOptions } from "../../types";
import type * as Evm from "../../evm";
export declare function decodeBytes(dataType: Format.Types.BytesTypeDynamic | Format.Types.StringType, pointer: Pointer.DataPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeString(bytes: Uint8Array): Format.Values.StringValueInfo;

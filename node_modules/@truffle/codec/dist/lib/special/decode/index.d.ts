import type * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest } from "../../types";
import * as Evm from "../../evm";
export declare function decodeSpecial(dataType: Format.Types.Type, pointer: Pointer.SpecialPointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeMagic(dataType: Format.Types.MagicType, pointer: Pointer.SpecialPointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.MagicResult, Uint8Array>;

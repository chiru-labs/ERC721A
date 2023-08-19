import type * as Format from "../../format";
import type * as Pointer from "../../pointer";
import type { DecoderRequest } from "../../types";
import * as Evm from "../../evm";
export declare function decodeConstant(dataType: Format.Types.Type, pointer: Pointer.ConstantDefinitionPointer, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;

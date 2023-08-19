import * as Format from "../../format";
import * as Contexts from "../../contexts";
import type * as Pointer from "../../pointer";
import type { DecoderRequest, DecoderOptions } from "../../types";
import * as Evm from "../../evm";
export declare function decodeBasic(dataType: Format.Types.Type, pointer: Pointer.DataPointer, info: Evm.EvmInfo, options?: DecoderOptions): Generator<DecoderRequest, Format.Values.Result, Uint8Array>;
export declare function decodeContract(addressBytes: Uint8Array, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.ContractValueInfo, Uint8Array>;
export declare function decodeExternalFunction(addressBytes: Uint8Array, selectorBytes: Uint8Array, info: Evm.EvmInfo): Generator<DecoderRequest, Format.Values.FunctionExternalValueInfo, Uint8Array>;
export declare function decodeInternalFunction(dataType: Format.Types.FunctionInternalType, deployedPcBytes: Uint8Array, constructorPcBytes: Uint8Array, info: Evm.EvmInfo): Format.Values.FunctionInternalResult;
export declare function checkPaddingLeft(bytes: Uint8Array, length: number): boolean;
/**
 * @hidden
 */
export interface ContractInfoAndContext {
    contractInfo: Format.Values.ContractValueInfo;
    context?: Contexts.Context;
}

import type * as Abi from "@truffle/abi-utils";
import type * as AbiData from "../abi-data/types";
import type * as Common from "../common";
import type * as Compiler from "../compiler";
import type { ImmutableReferences } from "@truffle/contract-schema/spec";
export interface Contexts {
    [context: string]: Context;
}
export interface Context {
    context: string;
    binary: string;
    isConstructor: boolean;
    immutableReferences?: ImmutableReferences;
    contractName?: string;
    contractId?: number;
    linearizedBaseContracts?: number[];
    contractKind?: Common.ContractKind;
    abi?: AbiData.FunctionAbiBySelectors;
    payable?: boolean;
    fallbackAbi?: {
        fallback: Abi.FallbackEntry | null;
        receive: Abi.ReceiveEntry | null;
    };
    compiler?: Compiler.CompilerVersion;
    compilationId?: string;
}
export interface DebuggerContext {
    context: string;
    binary: string;
    isConstructor: boolean;
    immutableReferences?: ImmutableReferences;
    contractName?: string;
    contractId?: number;
    linearizedBaseContracts?: number[];
    contractKind?: Common.ContractKind;
    abi?: Abi.Abi;
    sourceMap?: string;
    primarySource?: number;
    compiler?: Compiler.CompilerVersion;
    compilationId?: string;
    payable?: boolean;
}

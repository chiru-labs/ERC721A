import type * as Abi from "@truffle/abi-utils";
import type * as Compiler from "../../compiler";
import type * as Compilations from "../../compilations";
import type * as Ast from "../../ast";
import type * as Contexts from "../../contexts/types";
import type * as Pointer from "../../pointer";
import type { DecodingMode } from "../../types";
import type { ImmutableReferences } from "@truffle/contract-schema/spec";
import type * as Format from "../../format";
export interface ContractAllocationInfo {
    abi?: Abi.Abi;
    contractNode: Ast.AstNode;
    deployedContext?: Contexts.Context;
    constructorContext?: Contexts.Context;
    immutableReferences?: ImmutableReferences;
    compiler: Compiler.CompilerVersion;
    compilationId?: string;
}
export interface ContractAndContexts {
    compilationId: string;
    contract: Compilations.Contract;
    node: Ast.AstNode;
    deployedContext?: Contexts.Context;
    constructorContext?: Contexts.Context;
}
export interface AbiSizeInfo {
    size: number;
    dynamic: boolean;
}
export interface AbiAllocations {
    [id: string]: AbiAllocation | null;
}
export interface AbiAllocation {
    length: number;
    dynamic: boolean;
    members: AbiMemberAllocation[];
}
export interface AbiMemberAllocation {
    name: string;
    type: Format.Types.Type;
    pointer: Pointer.GenericAbiPointer;
}
export interface CalldataAllocations {
    constructorAllocations: CalldataConstructorAllocations;
    functionAllocations: CalldataFunctionAllocations;
}
export interface CalldataConstructorAllocations {
    [contextHash: string]: ConstructorCalldataAndReturndataAllocation;
}
export interface CalldataFunctionAllocations {
    [contextHash: string]: {
        [selector: string]: FunctionCalldataAndReturndataAllocation;
    };
}
export interface ConstructorCalldataAndReturndataAllocation {
    input: CalldataAllocation;
    output: ConstructorReturndataAllocation;
}
export interface FunctionCalldataAndReturndataAllocation {
    input: CalldataAllocation;
    output: ReturnValueReturndataAllocation;
}
export declare type CalldataAndReturndataAllocation = FunctionCalldataAndReturndataAllocation | ConstructorCalldataAndReturndataAllocation;
export interface CalldataAllocation {
    abi: Abi.FunctionEntry | Abi.ConstructorEntry;
    offset: number;
    arguments: CalldataArgumentAllocation[];
    allocationMode: DecodingMode;
}
export interface CalldataArgumentAllocation {
    name: string;
    type: Format.Types.Type;
    pointer: Pointer.CalldataPointer;
}
export interface EventAllocations {
    [topics: number]: {
        bySelector: {
            [selector: string]: {
                [contractKind: string]: {
                    [contextHash: string]: EventAllocation[];
                };
            };
        };
        anonymous: {
            [contractKind: string]: {
                [contextHash: string]: EventAllocation[];
            };
        };
    };
}
export interface EventAllocation {
    abi: Abi.EventEntry;
    contextHash: string;
    definedIn?: Format.Types.ContractType;
    id?: string;
    anonymous: boolean;
    arguments: EventArgumentAllocation[];
    allocationMode: DecodingMode;
}
export interface EventArgumentAllocation {
    name: string;
    type: Format.Types.Type;
    pointer: Pointer.EventDataPointer | Pointer.EventTopicPointer;
}
export interface ReturndataAllocations {
    [contextHash: string]: {
        [selector: string]: RevertReturndataAllocation[];
    };
}
export declare type ReturndataAllocation = ReturnValueReturndataAllocation | RevertReturndataAllocation | ConstructorReturndataAllocation | MessageReturndataAllocation | BlankReturndataAllocation;
export interface ReturnValueReturndataAllocation {
    kind: "return";
    selector: Uint8Array;
    arguments: ReturndataArgumentAllocation[];
    allocationMode: DecodingMode;
}
export interface RevertReturndataAllocation {
    kind: "revert";
    selector: Uint8Array;
    abi: Abi.ErrorEntry;
    id?: string;
    definedIn?: Format.Types.ContractType | null;
    arguments: ReturndataArgumentAllocation[];
    allocationMode: DecodingMode;
}
export interface ConstructorReturndataAllocation {
    kind: "bytecode";
    selector: Uint8Array;
    immutables?: ReturnImmutableAllocation[];
    delegatecallGuard: boolean;
    allocationMode: DecodingMode;
}
export interface BlankReturndataAllocation {
    kind: "failure" | "selfdestruct";
    selector: Uint8Array;
    arguments: [];
    allocationMode: DecodingMode;
}
export interface MessageReturndataAllocation {
    kind: "returnmessage";
    selector: Uint8Array;
    allocationMode: DecodingMode;
}
export interface ReturndataArgumentAllocation {
    name: string;
    type: Format.Types.Type;
    pointer: Pointer.ReturndataPointer;
}
export interface ReturnImmutableAllocation {
    name: string;
    type: Format.Types.Type;
    definedIn: Format.Types.ContractType;
    pointer: Pointer.ReturndataPointer;
}
export interface EventAllocationTemporary {
    selector: string;
    anonymous: boolean;
    topics: number;
    allocation: EventAllocation | undefined;
}
export interface CalldataAllocationTemporary {
    constructorAllocation?: ConstructorCalldataAndReturndataAllocation;
    functionAllocations: {
        [selector: string]: FunctionCalldataAndReturndataAllocation;
    };
}

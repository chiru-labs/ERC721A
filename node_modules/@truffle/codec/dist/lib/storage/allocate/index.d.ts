import * as Compiler from "../../compiler";
import type * as Storage from "../types";
import * as Ast from "../../ast";
import type { StorageAllocation, StorageAllocations, StorageMemberAllocation, StateAllocation, StateAllocations, StateVariableAllocation } from "./types";
import type { ContractAllocationInfo } from "../../abi-data/allocate";
import * as Format from "../../format";
export { StorageAllocation, StorageAllocations, StorageMemberAllocation, StateAllocation, StateAllocations, StateVariableAllocation };
export declare class UnknownBaseContractIdError extends Error {
    derivedId: number;
    derivedName: string;
    derivedKind: string;
    baseId: number;
    constructor(derivedId: number, derivedName: string, derivedKind: string, baseId: number);
}
export declare function getStorageAllocations(userDefinedTypesByCompilation: Format.Types.TypesByCompilationAndId): StorageAllocations;
/**
 * This function gets allocations for the state variables of the contracts;
 * this is distinct from getStorageAllocations, which gets allocations for
 * storage structs.
 *
 * While mostly state variables are kept in storage, constant ones are not.
 * And immutable ones, once those are introduced, will be kept in code!
 * (But those don't exist yet so this function doesn't handle them yet.)
 */
export declare function getStateAllocations(contracts: ContractAllocationInfo[], referenceDeclarations: {
    [compilationId: string]: Ast.AstNodes;
}, userDefinedTypes: Format.Types.TypesById, storageAllocations: StorageAllocations, existingAllocations?: StateAllocations): StateAllocations;
export declare function storageSize(dataType: Format.Types.Type, userDefinedTypes?: Format.Types.TypesById, allocations?: StorageAllocations, compiler?: Compiler.CompilerVersion): Storage.StorageLength;

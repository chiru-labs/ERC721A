import type * as Storage from "../types";
import type * as Ast from "../../ast/types";
import type * as Pointer from "../../pointer";
import type * as Format from "../../format";
export interface StorageAllocations {
    [id: string]: StorageAllocation;
}
export interface StorageAllocation {
    size: Storage.StorageLength;
    members: StorageMemberAllocation[];
}
export interface StorageMemberAllocation {
    name: string;
    type: Format.Types.Type;
    pointer: Pointer.StoragePointer;
}
export interface StateAllocations {
    [compilationId: string]: {
        [id: number]: StateAllocation;
    };
}
export interface StateAllocation {
    members: StateVariableAllocation[];
}
export interface StateVariableAllocation {
    definition: Ast.AstNode;
    definedIn: Ast.AstNode;
    compilationId: string;
    pointer: Pointer.StoragePointer | Pointer.ConstantDefinitionPointer | Pointer.CodeFormPointer;
}

export * as Utils from "./utils";
import * as Ast from "../../ast";
import type { AbiAllocations, AbiSizeInfo, CalldataAndReturndataAllocation, CalldataAllocation, ReturndataAllocation, ReturnValueReturndataAllocation, RevertReturndataAllocation, ConstructorReturndataAllocation, MessageReturndataAllocation, BlankReturndataAllocation, CalldataAllocations, ContractAllocationInfo, ContractAndContexts, EventAllocation, EventAllocations, ReturndataAllocations } from "./types";
import * as Format from "../../format";
export { AbiAllocations, AbiSizeInfo, CalldataAllocation, ReturndataAllocation, ReturnValueReturndataAllocation, RevertReturndataAllocation, ConstructorReturndataAllocation, MessageReturndataAllocation, BlankReturndataAllocation, CalldataAndReturndataAllocation, ContractAllocationInfo, ContractAndContexts, EventAllocation, ReturndataAllocations };
export declare const FallbackOutputAllocation: MessageReturndataAllocation;
export declare function getAbiAllocations(userDefinedTypes: Format.Types.TypesById): AbiAllocations;
/**
 * @protected
 */
export declare function abiSizeInfo(dataType: Format.Types.Type, allocations?: AbiAllocations): AbiSizeInfo;
export declare function getCalldataAllocations(contracts: ContractAllocationInfo[], referenceDeclarations: {
    [compilationId: string]: Ast.AstNodes;
}, userDefinedTypes: Format.Types.TypesById, abiAllocations: AbiAllocations): CalldataAllocations;
export declare function getReturndataAllocations(contracts: ContractAllocationInfo[], referenceDeclarations: {
    [compilationId: string]: Ast.AstNodes;
}, userDefinedTypes: Format.Types.TypesById, abiAllocations: AbiAllocations): ReturndataAllocations;
export declare function getEventAllocations(contracts: ContractAllocationInfo[], referenceDeclarations: {
    [compilationId: string]: Ast.AstNodes;
}, userDefinedTypes: Format.Types.TypesById, abiAllocations: AbiAllocations): EventAllocations;

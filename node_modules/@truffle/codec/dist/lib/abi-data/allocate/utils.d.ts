import type { ContractAllocationInfo, ContractAndContexts } from "./types";
import * as Compilations from "../../compilations";
import * as Contexts from "../../contexts";
export interface ContextAndAllocationInfo {
    contexts: Contexts.Contexts;
    deployedContexts: Contexts.Contexts;
    contractsAndContexts: ContractAndContexts[];
    allocationInfo: ContractAllocationInfo[];
}
export declare function collectAllocationInfo(compilations: Compilations.Compilation[]): ContextAndAllocationInfo;

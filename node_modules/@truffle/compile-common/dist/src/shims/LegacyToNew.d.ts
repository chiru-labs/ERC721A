import type { Bytecode, CompiledContract } from "../types";
export declare function forContracts(contracts: any[]): CompiledContract[];
export declare function forContract(contract: any): CompiledContract;
export declare function forBytecode(bytecode: string): Bytecode;

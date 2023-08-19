import { BytecodeWithLinkReferences, Contract } from 'typechain';
export declare function codegenContractTypings(contract: Contract): string;
export declare function codegenContractFactory(contract: Contract, abi: any, bytecode?: BytecodeWithLinkReferences): string;
export declare function codegenAbstractContractFactory(contract: Contract, abi: any): string;

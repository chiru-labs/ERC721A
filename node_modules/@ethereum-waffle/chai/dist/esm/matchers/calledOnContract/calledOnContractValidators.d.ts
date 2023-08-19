import { Contract } from 'ethers';
import { MockProvider } from '@ethereum-waffle/provider';
export declare function validateContract(contract: any): asserts contract is Contract;
export declare function validateMockProvider(provider: any): asserts provider is MockProvider;
export declare function validateFnName(fnName: any, contract: Contract): asserts fnName is string;

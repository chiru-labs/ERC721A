import { Contract, Signer, utils } from 'ethers';
import { Fragment, JsonFragment } from '@ethersproject/abi';
declare type ABI = string | Array<Fragment | JsonFragment | string>;
export declare type Stub = ReturnType<typeof stub>;
export interface MockContract extends Contract {
    mock: {
        [key: string]: Stub;
    };
    call(contract: Contract, functionName: string, ...params: any[]): Promise<any>;
    staticcall(contract: Contract, functionName: string, ...params: any[]): Promise<any>;
}
declare function stub(mockContract: Contract, encoder: utils.AbiCoder, func: utils.FunctionFragment, params?: any[]): {
    returns: (...args: any) => Promise<void>;
    reverts: () => Promise<any>;
    revertsWithReason: (reason: string) => Promise<any>;
    withArgs: (...args: any[]) => any;
};
export declare function deployMockContract(signer: Signer, abi: ABI): Promise<MockContract>;
export {};

import { providers, ContractFactory, Signer, Wallet, Contract } from 'ethers';
import { ContractJSON } from './ContractJSON';
declare type Newable<T> = {
    new (...args: any[]): T;
};
export declare function deployContract(signer: Signer, contractJSON: ContractJSON, args?: any[], overrideOptions?: providers.TransactionRequest): Promise<Contract>;
export declare function deployContract<T extends ContractFactory>(wallet: Wallet, Factory: Newable<T>, args: Parameters<T['deploy']>, overrideOptions?: providers.TransactionRequest): Promise<ReturnType<T['deploy']>>;
export {};

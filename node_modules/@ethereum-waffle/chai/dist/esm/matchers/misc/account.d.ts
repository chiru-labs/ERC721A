import { Contract, Signer, Wallet } from 'ethers';
export declare type Account = Signer | Contract;
export declare function isAccount(account: Account): account is Contract | Wallet;
export declare function getAddressOf(account: Account): Promise<string>;

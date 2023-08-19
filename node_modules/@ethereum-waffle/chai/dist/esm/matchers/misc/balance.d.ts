import { Account } from './account';
export interface BalanceChangeOptions {
    includeFee?: boolean;
}
export declare function getAddresses(accounts: Account[]): Promise<string[]>;
export declare function getBalances(accounts: Account[], blockNumber?: number): Promise<import("ethers").BigNumber[]>;

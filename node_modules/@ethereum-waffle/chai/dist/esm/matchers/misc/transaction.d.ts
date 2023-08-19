import type { Transaction, providers } from 'ethers';
export declare type MaybePendingTransaction = Promise<Transaction> | Transaction | string;
export declare function waitForPendingTransaction(tx: MaybePendingTransaction, provider: providers.Provider): Promise<providers.TransactionReceipt>;

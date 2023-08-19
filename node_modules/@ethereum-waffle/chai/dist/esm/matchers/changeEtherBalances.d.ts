/// <reference types="chai" />
import { BigNumber, providers } from 'ethers';
import { Account } from './misc/account';
import { BalanceChangeOptions } from './misc/balance';
export declare function supportChangeEtherBalances(Assertion: Chai.AssertionStatic): void;
export declare function getBalanceChanges(transaction: providers.TransactionResponse | (() => Promise<providers.TransactionResponse> | providers.TransactionResponse), accounts: Account[], options: BalanceChangeOptions): Promise<BigNumber[]>;

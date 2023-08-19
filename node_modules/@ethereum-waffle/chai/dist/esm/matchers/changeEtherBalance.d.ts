/// <reference types="chai" />
import { BigNumber, providers } from 'ethers';
import { Account } from './misc/account';
import { BalanceChangeOptions } from './misc/balance';
export declare function supportChangeEtherBalance(Assertion: Chai.AssertionStatic): void;
export declare function getBalanceChange(transaction: providers.TransactionResponse | (() => Promise<providers.TransactionResponse> | providers.TransactionResponse), account: Account, options?: BalanceChangeOptions): Promise<BigNumber>;

import { ensure } from '../calledOnContract/utils';
import { getAddressOf } from './account';
export function getAddresses(accounts) {
    return Promise.all(accounts.map((account) => getAddressOf(account)));
}
export async function getBalances(accounts, blockNumber) {
    return Promise.all(accounts.map((account) => {
        ensure(account.provider !== undefined, TypeError, 'Provider not found');
        if (blockNumber !== undefined) {
            return account.provider.getBalance(getAddressOf(account), blockNumber);
        }
        else {
            return account.provider.getBalance(getAddressOf(account));
        }
    }));
}

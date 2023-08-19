import { Contract, Wallet } from 'ethers';
export function isAccount(account) {
    return account instanceof Contract || account instanceof Wallet;
}
export async function getAddressOf(account) {
    if (isAccount(account)) {
        return account.address;
    }
    else {
        return account.getAddress();
    }
}

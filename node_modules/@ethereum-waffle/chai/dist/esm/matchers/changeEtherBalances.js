import { BigNumber } from 'ethers';
import { getAddressOf } from './misc/account';
import { getAddresses, getBalances } from './misc/balance';
export function supportChangeEtherBalances(Assertion) {
    Assertion.addMethod('changeEtherBalances', function (accounts, balanceChanges, options) {
        const subject = this._obj;
        const derivedPromise = Promise.all([
            getBalanceChanges(subject, accounts, options),
            getAddresses(accounts)
        ]).then(([actualChanges, accountAddresses]) => {
            this.assert(actualChanges.every((change, ind) => change.eq(BigNumber.from(balanceChanges[ind]))), `Expected ${accountAddresses} to change balance by ${balanceChanges} wei, ` +
                `but it has changed by ${actualChanges} wei`, `Expected ${accountAddresses} to not change balance by ${balanceChanges} wei,`, balanceChanges.map((balanceChange) => balanceChange.toString()), actualChanges.map((actualChange) => actualChange.toString()));
        });
        this.then = derivedPromise.then.bind(derivedPromise);
        this.catch = derivedPromise.catch.bind(derivedPromise);
        this.promise = derivedPromise;
        return this;
    });
}
export async function getBalanceChanges(transaction, accounts, options) {
    let txResponse;
    if (typeof transaction === 'function') {
        txResponse = await transaction();
    }
    else {
        txResponse = transaction;
    }
    const txReceipt = await txResponse.wait();
    const txBlockNumber = txReceipt.blockNumber;
    const balancesAfter = await getBalances(accounts, txBlockNumber);
    const balancesBefore = await getBalances(accounts, txBlockNumber - 1);
    const txFees = await getTxFees(accounts, txResponse, options);
    return balancesAfter.map((balance, ind) => balance.add(txFees[ind]).sub(balancesBefore[ind]));
}
async function getTxFees(accounts, txResponse, options) {
    return Promise.all(accounts.map(async (account) => {
        var _a;
        if ((options === null || options === void 0 ? void 0 : options.includeFee) !== true && await getAddressOf(account) === txResponse.from) {
            const txReceipt = await txResponse.wait();
            const gasPrice = (_a = txResponse.gasPrice) !== null && _a !== void 0 ? _a : txReceipt.effectiveGasPrice;
            const gasUsed = txReceipt.gasUsed;
            const txFee = gasPrice.mul(gasUsed);
            return txFee;
        }
        return 0;
    }));
}

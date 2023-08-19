"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalanceChanges = exports.supportChangeEtherBalances = void 0;
const ethers_1 = require("ethers");
const account_1 = require("./misc/account");
const balance_1 = require("./misc/balance");
function supportChangeEtherBalances(Assertion) {
    Assertion.addMethod('changeEtherBalances', function (accounts, balanceChanges, options) {
        const subject = this._obj;
        const derivedPromise = Promise.all([
            getBalanceChanges(subject, accounts, options),
            balance_1.getAddresses(accounts)
        ]).then(([actualChanges, accountAddresses]) => {
            this.assert(actualChanges.every((change, ind) => change.eq(ethers_1.BigNumber.from(balanceChanges[ind]))), `Expected ${accountAddresses} to change balance by ${balanceChanges} wei, ` +
                `but it has changed by ${actualChanges} wei`, `Expected ${accountAddresses} to not change balance by ${balanceChanges} wei,`, balanceChanges.map((balanceChange) => balanceChange.toString()), actualChanges.map((actualChange) => actualChange.toString()));
        });
        this.then = derivedPromise.then.bind(derivedPromise);
        this.catch = derivedPromise.catch.bind(derivedPromise);
        this.promise = derivedPromise;
        return this;
    });
}
exports.supportChangeEtherBalances = supportChangeEtherBalances;
async function getBalanceChanges(transaction, accounts, options) {
    let txResponse;
    if (typeof transaction === 'function') {
        txResponse = await transaction();
    }
    else {
        txResponse = transaction;
    }
    const txReceipt = await txResponse.wait();
    const txBlockNumber = txReceipt.blockNumber;
    const balancesAfter = await balance_1.getBalances(accounts, txBlockNumber);
    const balancesBefore = await balance_1.getBalances(accounts, txBlockNumber - 1);
    const txFees = await getTxFees(accounts, txResponse, options);
    return balancesAfter.map((balance, ind) => balance.add(txFees[ind]).sub(balancesBefore[ind]));
}
exports.getBalanceChanges = getBalanceChanges;
async function getTxFees(accounts, txResponse, options) {
    return Promise.all(accounts.map(async (account) => {
        var _a;
        if ((options === null || options === void 0 ? void 0 : options.includeFee) !== true && await account_1.getAddressOf(account) === txResponse.from) {
            const txReceipt = await txResponse.wait();
            const gasPrice = (_a = txResponse.gasPrice) !== null && _a !== void 0 ? _a : txReceipt.effectiveGasPrice;
            const gasUsed = txReceipt.gasUsed;
            const txFee = gasPrice.mul(gasUsed);
            return txFee;
        }
        return 0;
    }));
}

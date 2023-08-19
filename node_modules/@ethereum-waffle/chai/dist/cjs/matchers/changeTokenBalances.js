"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportChangeTokenBalances = void 0;
const ethers_1 = require("ethers");
const account_1 = require("./misc/account");
function supportChangeTokenBalances(Assertion) {
    Assertion.addMethod('changeTokenBalances', function (token, accounts, balanceChanges) {
        const subject = this._obj;
        const derivedPromise = Promise.all([
            getBalanceChanges(subject, token, accounts),
            getAddresses(accounts)
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
exports.supportChangeTokenBalances = supportChangeTokenBalances;
function getAddresses(accounts) {
    return Promise.all(accounts.map((account) => account_1.getAddressOf(account)));
}
async function getBalances(token, accounts) {
    return Promise.all(accounts.map(async (account) => {
        return token['balanceOf(address)'](account_1.getAddressOf(account));
    }));
}
async function getBalanceChanges(transactionCall, token, accounts) {
    const balancesBefore = await getBalances(token, accounts);
    await transactionCall();
    const balancesAfter = await getBalances(token, accounts);
    return balancesAfter.map((balance, ind) => balance.sub(balancesBefore[ind]));
}

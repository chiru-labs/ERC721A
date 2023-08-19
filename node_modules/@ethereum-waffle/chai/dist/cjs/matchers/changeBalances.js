"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportChangeBalances = void 0;
const ethers_1 = require("ethers");
const changeEtherBalances_1 = require("./changeEtherBalances");
const balance_1 = require("./misc/balance");
function supportChangeBalances(Assertion) {
    Assertion.addMethod('changeBalances', function (accounts, balanceChanges) {
        const subject = this._obj;
        const derivedPromise = Promise.all([
            changeEtherBalances_1.getBalanceChanges(subject, accounts, { includeFee: true }),
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
exports.supportChangeBalances = supportChangeBalances;

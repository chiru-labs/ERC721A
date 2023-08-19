"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportChangeBalance = void 0;
const ethers_1 = require("ethers");
const account_1 = require("./misc/account");
const changeEtherBalance_1 = require("./changeEtherBalance");
function supportChangeBalance(Assertion) {
    Assertion.addMethod('changeBalance', function (account, balanceChange) {
        const subject = this._obj;
        const derivedPromise = Promise.all([
            changeEtherBalance_1.getBalanceChange(subject, account, { includeFee: true }),
            account_1.getAddressOf(account)
        ]).then(([actualChange, address]) => {
            this.assert(actualChange.eq(ethers_1.BigNumber.from(balanceChange)), `Expected "${address}" to change balance by ${balanceChange} wei, ` +
                `but it has changed by ${actualChange} wei`, `Expected "${address}" to not change balance by ${balanceChange} wei,`, balanceChange, actualChange);
        });
        this.then = derivedPromise.then.bind(derivedPromise);
        this.catch = derivedPromise.catch.bind(derivedPromise);
        this.promise = derivedPromise;
        return this;
    });
}
exports.supportChangeBalance = supportChangeBalance;

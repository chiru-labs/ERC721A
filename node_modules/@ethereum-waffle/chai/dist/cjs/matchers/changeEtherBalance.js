"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalanceChange = exports.supportChangeEtherBalance = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("./calledOnContract/utils");
const account_1 = require("./misc/account");
function supportChangeEtherBalance(Assertion) {
    Assertion.addMethod('changeEtherBalance', function (account, balanceChange, options) {
        const subject = this._obj;
        const derivedPromise = Promise.all([
            getBalanceChange(subject, account, options),
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
exports.supportChangeEtherBalance = supportChangeEtherBalance;
async function getBalanceChange(transaction, account, options) {
    var _a;
    utils_1.ensure(account.provider !== undefined, TypeError, 'Provider not found');
    let txResponse;
    if (typeof transaction === 'function') {
        txResponse = await transaction();
    }
    else {
        txResponse = transaction;
    }
    const txReceipt = await txResponse.wait();
    const txBlockNumber = txReceipt.blockNumber;
    const balanceAfter = await account.provider.getBalance(account_1.getAddressOf(account), txBlockNumber);
    const balanceBefore = await account.provider.getBalance(account_1.getAddressOf(account), txBlockNumber - 1);
    if ((options === null || options === void 0 ? void 0 : options.includeFee) !== true && await account_1.getAddressOf(account) === txResponse.from) {
        const gasPrice = (_a = txResponse.gasPrice) !== null && _a !== void 0 ? _a : txReceipt.effectiveGasPrice;
        const gasUsed = txReceipt.gasUsed;
        const txFee = gasPrice.mul(gasUsed);
        return balanceAfter.add(txFee).sub(balanceBefore);
    }
    else {
        return balanceAfter.sub(balanceBefore);
    }
}
exports.getBalanceChange = getBalanceChange;

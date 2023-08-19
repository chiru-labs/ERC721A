"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalances = exports.getAddresses = void 0;
const utils_1 = require("../calledOnContract/utils");
const account_1 = require("./account");
function getAddresses(accounts) {
    return Promise.all(accounts.map((account) => account_1.getAddressOf(account)));
}
exports.getAddresses = getAddresses;
async function getBalances(accounts, blockNumber) {
    return Promise.all(accounts.map((account) => {
        utils_1.ensure(account.provider !== undefined, TypeError, 'Provider not found');
        if (blockNumber !== undefined) {
            return account.provider.getBalance(account_1.getAddressOf(account), blockNumber);
        }
        else {
            return account.provider.getBalance(account_1.getAddressOf(account));
        }
    }));
}
exports.getBalances = getBalances;

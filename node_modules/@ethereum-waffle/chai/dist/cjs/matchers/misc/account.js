"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressOf = exports.isAccount = void 0;
const ethers_1 = require("ethers");
function isAccount(account) {
    return account instanceof ethers_1.Contract || account instanceof ethers_1.Wallet;
}
exports.isAccount = isAccount;
async function getAddressOf(account) {
    if (isAccount(account)) {
        return account.address;
    }
    else {
        return account.getAddress();
    }
}
exports.getAddressOf = getAddressOf;

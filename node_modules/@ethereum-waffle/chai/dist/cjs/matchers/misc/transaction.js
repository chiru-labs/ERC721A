"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForPendingTransaction = void 0;
async function waitForPendingTransaction(tx, provider) {
    let hash;
    if (tx instanceof Promise) {
        ({ hash } = await tx);
    }
    else if (typeof tx === 'string') {
        hash = tx;
    }
    else {
        ({ hash } = tx);
    }
    if (!hash) {
        throw new Error(`${tx} is not a valid transaction`);
    }
    return provider.waitForTransaction(hash);
}
exports.waitForPendingTransaction = waitForPendingTransaction;

export async function waitForPendingTransaction(tx, provider) {
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFixtureLoader = exports.loadFixture = void 0;
const MockProvider_1 = require("./MockProvider");
exports.loadFixture = createFixtureLoader();
function createFixtureLoader(overrideWallets, overrideProvider) {
    const snapshots = [];
    return async function load(fixture) {
        const snapshot = snapshots.find((snapshot) => snapshot.fixture === fixture);
        if (snapshot) {
            await snapshot.provider.send('evm_revert', [snapshot.id]);
            snapshot.id = await snapshot.provider.send('evm_snapshot', []);
            return snapshot.data;
        }
        else {
            const provider = overrideProvider !== null && overrideProvider !== void 0 ? overrideProvider : new MockProvider_1.MockProvider();
            const wallets = overrideWallets !== null && overrideWallets !== void 0 ? overrideWallets : provider.getWallets();
            const data = await fixture(wallets, provider);
            const id = await provider.send('evm_snapshot', []);
            snapshots.push({ fixture, data, id, provider, wallets });
            return data;
        }
    };
}
exports.createFixtureLoader = createFixtureLoader;

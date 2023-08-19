import { MockProvider } from './MockProvider';
export const loadFixture = createFixtureLoader();
export function createFixtureLoader(overrideWallets, overrideProvider) {
    const snapshots = [];
    return async function load(fixture) {
        const snapshot = snapshots.find((snapshot) => snapshot.fixture === fixture);
        if (snapshot) {
            await snapshot.provider.send('evm_revert', [snapshot.id]);
            snapshot.id = await snapshot.provider.send('evm_snapshot', []);
            return snapshot.data;
        }
        else {
            const provider = overrideProvider !== null && overrideProvider !== void 0 ? overrideProvider : new MockProvider();
            const wallets = overrideWallets !== null && overrideWallets !== void 0 ? overrideWallets : provider.getWallets();
            const data = await fixture(wallets, provider);
            const id = await provider.send('evm_snapshot', []);
            snapshots.push({ fixture, data, id, provider, wallets });
            return data;
        }
    };
}

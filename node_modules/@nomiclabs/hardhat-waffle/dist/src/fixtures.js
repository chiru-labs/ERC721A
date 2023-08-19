"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardhatCreateFixtureLoader = void 0;
function createFixtureLoader(signers, provider) {
    const snapshots = [];
    return async function load(fixture) {
        const snapshot = snapshots.find((p) => p.fixture === fixture);
        if (snapshot !== undefined) {
            await snapshot.provider.send("evm_revert", [snapshot.id]);
            snapshot.id = await snapshot.provider.send("evm_snapshot", []);
            return snapshot.data;
        }
        {
            const data = await fixture(signers, provider);
            const id = await provider.send("evm_snapshot", []);
            snapshots.push({ fixture, data, id, provider, signers });
            return data;
        }
    };
}
function hardhatCreateFixtureLoader(hardhatWaffleProvider, overrideSigners, overrideProvider) {
    return createFixtureLoader(overrideSigners, overrideProvider !== null && overrideProvider !== void 0 ? overrideProvider : hardhatWaffleProvider);
}
exports.hardhatCreateFixtureLoader = hardhatCreateFixtureLoader;
//# sourceMappingURL=fixtures.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaffleMockProviderAdapter = void 0;
const ethers_1 = require("ethers");
const util_1 = require("hardhat/internal/core/providers/util");
// This class is an extension of hardhat-ethers' wrapper.
// TODO: Export hardhat-ether's wrapper so this can be implemented like a normal
//  subclass.
class WaffleMockProviderAdapter extends ethers_1.providers.JsonRpcProvider {
    constructor(_hardhatNetwork) {
        super();
        this._hardhatNetwork = _hardhatNetwork;
    }
    getWallets() {
        if (this._hardhatNetwork.name !== "hardhat") {
            throw new Error(`This method only works with Hardhat Network.
You can use \`await hre.ethers.signers()\` in other networks.`);
        }
        const networkConfig = this._hardhatNetwork.config;
        return util_1.normalizeHardhatNetworkAccountsConfig(networkConfig.accounts).map((acc) => new ethers_1.Wallet(acc.privateKey, this));
    }
    createEmptyWallet() {
        return ethers_1.Wallet.createRandom().connect(this);
    }
    // Copied from hardhat-ethers
    async send(method, params) {
        const result = await this._hardhatNetwork.provider.send(method, params);
        // We replicate ethers' behavior.
        this.emit("debug", {
            action: "send",
            request: {
                id: 42,
                jsonrpc: "2.0",
                method,
                params,
            },
            response: result,
            provider: this,
        });
        return result;
    }
}
exports.WaffleMockProviderAdapter = WaffleMockProviderAdapter;
//# sourceMappingURL=waffle-provider-adapter.js.map
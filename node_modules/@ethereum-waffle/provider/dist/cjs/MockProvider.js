"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider = void 0;
const ethers_1 = require("ethers");
const CallHistory_1 = require("./CallHistory");
const defaultAccounts_1 = require("./defaultAccounts");
const ens_1 = require("@ethereum-waffle/ens");
class MockProvider extends ethers_1.providers.Web3Provider {
    constructor(options) {
        super(require('ganache-core').provider({ accounts: defaultAccounts_1.defaultAccounts, ...options === null || options === void 0 ? void 0 : options.ganacheOptions }));
        this.options = options;
        this._callHistory = new CallHistory_1.CallHistory();
        this._callHistory.record(this);
    }
    getWallets() {
        var _a, _b;
        const items = (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.ganacheOptions.accounts) !== null && _b !== void 0 ? _b : defaultAccounts_1.defaultAccounts;
        return items.map((x) => new ethers_1.Wallet(x.secretKey, this));
    }
    createEmptyWallet() {
        return ethers_1.Wallet.createRandom().connect(this);
    }
    clearCallHistory() {
        this._callHistory.clear();
    }
    get callHistory() {
        return this._callHistory.getCalls();
    }
    get ens() {
        return this._ens;
    }
    async setupENS(wallet) {
        if (!wallet) {
            const wallets = this.getWallets();
            wallet = wallets[wallets.length - 1];
        }
        const ens = await ens_1.deployENS(wallet);
        this.network.ensAddress = ens.ens.address;
        this._ens = ens;
    }
}
exports.MockProvider = MockProvider;

import { providers, Wallet } from 'ethers';
import { CallHistory } from './CallHistory';
import { defaultAccounts } from './defaultAccounts';
import { deployENS } from '@ethereum-waffle/ens';
export class MockProvider extends providers.Web3Provider {
    constructor(options) {
        super(require('ganache-core').provider({ accounts: defaultAccounts, ...options === null || options === void 0 ? void 0 : options.ganacheOptions }));
        this.options = options;
        this._callHistory = new CallHistory();
        this._callHistory.record(this);
    }
    getWallets() {
        var _a, _b;
        const items = (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.ganacheOptions.accounts) !== null && _b !== void 0 ? _b : defaultAccounts;
        return items.map((x) => new Wallet(x.secretKey, this));
    }
    createEmptyWallet() {
        return Wallet.createRandom().connect(this);
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
        const ens = await deployENS(wallet);
        this.network.ensAddress = ens.ens.address;
        this._ens = ens;
    }
}

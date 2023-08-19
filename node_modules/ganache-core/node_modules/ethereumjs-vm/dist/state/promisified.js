"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var promisify = require('util.promisify');
/**
 * Promisified wrapper around [[StateManager]]
 * @ignore
 */
var PStateManager = /** @class */ (function () {
    function PStateManager(wrapped) {
        this._wrapped = wrapped;
        // We cache these promisified function as they are called lots of times during the VM execution,
        // and promisifying them each time has degrades its performance.
        this.getAccount = promisify(this._wrapped.getAccount.bind(this._wrapped));
        this.putAccount = promisify(this._wrapped.putAccount.bind(this._wrapped));
        this.putContractCode = promisify(this._wrapped.putContractCode.bind(this._wrapped));
        this.getContractCode = promisify(this._wrapped.getContractCode.bind(this._wrapped));
        this.getContractStorage = promisify(this._wrapped.getContractStorage.bind(this._wrapped));
        this.getOriginalContractStorage = promisify(this._wrapped.getOriginalContractStorage.bind(this._wrapped));
        this.putContractStorage = promisify(this._wrapped.putContractStorage.bind(this._wrapped));
        this.clearContractStorage = promisify(this._wrapped.clearContractStorage.bind(this._wrapped));
        this.checkpoint = promisify(this._wrapped.checkpoint.bind(this._wrapped));
        this.commit = promisify(this._wrapped.commit.bind(this._wrapped));
        this.revert = promisify(this._wrapped.revert.bind(this._wrapped));
        this.getStateRoot = promisify(this._wrapped.getStateRoot.bind(this._wrapped));
        this.setStateRoot = promisify(this._wrapped.setStateRoot.bind(this._wrapped));
        this.dumpStorage = promisify(this._wrapped.dumpStorage.bind(this._wrapped));
        this.hasGenesisState = promisify(this._wrapped.hasGenesisState.bind(this._wrapped));
        this.generateCanonicalGenesis = promisify(this._wrapped.generateCanonicalGenesis.bind(this._wrapped));
        this.generateGenesis = promisify(this._wrapped.generateGenesis.bind(this._wrapped));
        this.accountIsEmpty = promisify(this._wrapped.accountIsEmpty.bind(this._wrapped));
        this.cleanupTouchedAccounts = promisify(this._wrapped.cleanupTouchedAccounts.bind(this._wrapped));
    }
    PStateManager.prototype.copy = function () {
        return new PStateManager(this._wrapped.copy());
    };
    return PStateManager;
}());
exports.default = PStateManager;
//# sourceMappingURL=promisified.js.map
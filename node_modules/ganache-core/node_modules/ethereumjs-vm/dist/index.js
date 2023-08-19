"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ethereumjs_account_1 = require("ethereumjs-account");
var ethereumjs_blockchain_1 = require("ethereumjs-blockchain");
var ethereumjs_common_1 = require("ethereumjs-common");
var state_1 = require("./state");
var runCode_1 = require("./runCode");
var runCall_1 = require("./runCall");
var runTx_1 = require("./runTx");
var runBlock_1 = require("./runBlock");
var opcodes_1 = require("./evm/opcodes");
var runBlockchain_1 = require("./runBlockchain");
var promisified_1 = require("./state/promisified");
var promisify = require('util.promisify');
var AsyncEventEmitter = require('async-eventemitter');
var Trie = require('merkle-patricia-tree/secure.js');
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
var VM = /** @class */ (function (_super) {
    __extends(VM, _super);
    /**
     * Instantiates a new [[VM]] Object.
     * @param opts - Default values for the options are:
     *  - `chain`: 'mainnet'
     *  - `hardfork`: 'petersburg' [supported: 'byzantium', 'constantinople', 'petersburg', 'istanbul' (DRAFT) (will throw on unsupported)]
     *  - `activatePrecompiles`: false
     *  - `allowUnlimitedContractSize`: false [ONLY set to `true` during debugging]
     */
    function VM(opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this) || this;
        _this.opts = opts;
        if (opts.common) {
            if (opts.chain || opts.hardfork) {
                throw new Error('You can only instantiate the VM class with one of: opts.common, or opts.chain and opts.hardfork');
            }
            _this._common = opts.common;
        }
        else {
            var chain = opts.chain ? opts.chain : 'mainnet';
            var hardfork = opts.hardfork ? opts.hardfork : 'petersburg';
            var supportedHardforks = [
                'byzantium',
                'constantinople',
                'petersburg',
                'istanbul',
                'muirGlacier',
            ];
            _this._common = new ethereumjs_common_1.default(chain, hardfork, supportedHardforks);
        }
        // Set list of opcodes based on HF
        _this._opcodes = opcodes_1.getOpcodesForHF(_this._common);
        if (opts.stateManager) {
            _this.stateManager = opts.stateManager;
        }
        else {
            var trie = opts.state || new Trie();
            if (opts.activatePrecompiles) {
                for (var i = 1; i <= 8; i++) {
                    trie.put(new BN(i).toArrayLike(Buffer, 'be', 20), new ethereumjs_account_1.default().serialize());
                }
            }
            _this.stateManager = new state_1.StateManager({ trie: trie, common: _this._common });
        }
        _this.pStateManager = new promisified_1.default(_this.stateManager);
        _this.blockchain = opts.blockchain || new ethereumjs_blockchain_1.default({ common: _this._common });
        _this.allowUnlimitedContractSize =
            opts.allowUnlimitedContractSize === undefined ? false : opts.allowUnlimitedContractSize;
        // We cache this promisified function as it's called from the main execution loop, and
        // promisifying each time has a huge performance impact.
        _this._emit = promisify(_this.emit.bind(_this));
        return _this;
    }
    /**
     * Processes blocks and adds them to the blockchain.
     *
     * This method modifies the state.
     *
     * @param blockchain -  A [blockchain](https://github.com/ethereum/ethereumjs-blockchain) object to process
     */
    VM.prototype.runBlockchain = function (blockchain) {
        return runBlockchain_1.default.bind(this)(blockchain);
    };
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     *
     * This method modifies the state. If `generate` is `true`, the state modifications will be
     * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
     * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
     *
     * @param opts - Default values for options:
     *  - `generate`: false
     */
    VM.prototype.runBlock = function (opts) {
        return runBlock_1.default.bind(this)(opts);
    };
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     */
    VM.prototype.runTx = function (opts) {
        return runTx_1.default.bind(this)(opts);
    };
    /**
     * runs a call (or create) operation.
     *
     * This method modifies the state.
     */
    VM.prototype.runCall = function (opts) {
        return runCall_1.default.bind(this)(opts);
    };
    /**
     * Runs EVM code.
     *
     * This method modifies the state.
     */
    VM.prototype.runCode = function (opts) {
        return runCode_1.default.bind(this)(opts);
    };
    /**
     * Returns a copy of the [[VM]] instance.
     */
    VM.prototype.copy = function () {
        return new VM({
            stateManager: this.stateManager.copy(),
            blockchain: this.blockchain,
            common: this._common,
        });
    };
    return VM;
}(AsyncEventEmitter));
exports.default = VM;
//# sourceMappingURL=index.js.map
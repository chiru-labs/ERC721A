"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const merkle_patricia_tree_1 = require("merkle-patricia-tree");
const ethereumjs_util_1 = require("ethereumjs-util");
const blockchain_1 = __importDefault(require("@ethereumjs/blockchain"));
const common_1 = __importStar(require("@ethereumjs/common"));
const index_1 = require("./state/index");
const runCode_1 = __importDefault(require("./runCode"));
const runCall_1 = __importDefault(require("./runCall"));
const runTx_1 = __importDefault(require("./runTx"));
const runBlock_1 = __importDefault(require("./runBlock"));
const buildBlock_1 = __importDefault(require("./buildBlock"));
const opcodes_1 = require("./evm/opcodes");
const precompiles_1 = require("./evm/precompiles");
const runBlockchain_1 = __importDefault(require("./runBlockchain"));
const AsyncEventEmitter = require('async-eventemitter');
const util_1 = require("util");
// very ugly way to detect if we are running in a browser
const isBrowser = new Function('try {return this===window;}catch(e){ return false;}');
let mcl;
let mclInitPromise;
if (!isBrowser()) {
    mcl = require('mcl-wasm');
    mclInitPromise = mcl.init(mcl.BLS12_381);
}
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
class VM extends AsyncEventEmitter {
    /**
     * Instantiates a new {@link VM} Object.
     * @param opts
     */
    constructor(opts = {}) {
        var _a, _b, _c, _d;
        super();
        this._isInitialized = false;
        /**
         * VM is run in DEBUG mode (default: false)
         * Taken from DEBUG environment variable
         *
         * Safeguards on debug() calls are added for
         * performance reasons to avoid string literal evaluation
         * @hidden
         */
        this.DEBUG = false;
        this._opts = opts;
        // Throw on chain or hardfork options removed in latest major release
        // to prevent implicit chain setup on a wrong chain
        if ('chain' in opts || 'hardfork' in opts) {
            throw new Error('Chain/hardfork options are not allowed any more on initialization');
        }
        if (opts.common) {
            //EIPs
            const supportedEIPs = [1559, 2315, 2537, 2565, 2718, 2929, 2930, 3198, 3529, 3541];
            for (const eip of opts.common.eips()) {
                if (!supportedEIPs.includes(eip)) {
                    throw new Error(`${eip} is not supported by the VM`);
                }
            }
            this._common = opts.common;
        }
        else {
            const DEFAULT_CHAIN = common_1.Chain.Mainnet;
            const supportedHardforks = [
                'chainstart',
                'homestead',
                'dao',
                'tangerineWhistle',
                'spuriousDragon',
                'byzantium',
                'constantinople',
                'petersburg',
                'istanbul',
                'muirGlacier',
                'berlin',
                'arrowGlacier',
            ];
            this._common = new common_1.default({
                chain: DEFAULT_CHAIN,
                supportedHardforks,
            });
        }
        this._common.on('hardforkChanged', () => {
            this._opcodes = (0, opcodes_1.getOpcodesForHF)(this._common);
        });
        // Set list of opcodes based on HF
        // TODO: make this EIP-friendly
        this._opcodes = (0, opcodes_1.getOpcodesForHF)(this._common);
        if (opts.stateManager) {
            this.stateManager = opts.stateManager;
        }
        else {
            const trie = (_a = opts.state) !== null && _a !== void 0 ? _a : new merkle_patricia_tree_1.SecureTrie();
            this.stateManager = new index_1.DefaultStateManager({
                trie,
                common: this._common,
            });
        }
        this.blockchain = (_b = opts.blockchain) !== null && _b !== void 0 ? _b : new blockchain_1.default({ common: this._common });
        this._allowUnlimitedContractSize = (_c = opts.allowUnlimitedContractSize) !== null && _c !== void 0 ? _c : false;
        if (opts.hardforkByBlockNumber !== undefined && opts.hardforkByTD !== undefined) {
            throw new Error(`The hardforkByBlockNumber and hardforkByTD options can't be used in conjunction`);
        }
        this._hardforkByBlockNumber = (_d = opts.hardforkByBlockNumber) !== null && _d !== void 0 ? _d : false;
        this._hardforkByTD = opts.hardforkByTD;
        if (this._common.isActivatedEIP(2537)) {
            if (isBrowser()) {
                throw new Error('EIP-2537 is currently not supported in browsers');
            }
            else {
                this._mcl = mcl;
            }
        }
        // Safeguard if "process" is not available (browser)
        if (process !== undefined && process.env.DEBUG) {
            this.DEBUG = true;
        }
        // We cache this promisified function as it's called from the main execution loop, and
        // promisifying each time has a huge performance impact.
        this._emit = (0, util_1.promisify)(this.emit.bind(this));
    }
    /**
     * VM async constructor. Creates engine instance and initializes it.
     *
     * @param opts VM engine constructor options
     */
    static async create(opts = {}) {
        const vm = new this(opts);
        await vm.init();
        return vm;
    }
    async init() {
        if (this._isInitialized) {
            return;
        }
        await this.blockchain.initPromise;
        if (this._opts.activatePrecompiles && !this._opts.stateManager) {
            await this.stateManager.checkpoint();
            // put 1 wei in each of the precompiles in order to make the accounts non-empty and thus not have them deduct `callNewAccount` gas.
            await Promise.all(Object.keys(precompiles_1.precompiles)
                .map((k) => new ethereumjs_util_1.Address(Buffer.from(k, 'hex')))
                .map(async (address) => {
                const account = ethereumjs_util_1.Account.fromAccountData({ balance: 1 });
                await this.stateManager.putAccount(address, account);
            }));
            await this.stateManager.commit();
        }
        if (this._common.isActivatedEIP(2537)) {
            if (isBrowser()) {
                throw new Error('EIP-2537 is currently not supported in browsers');
            }
            else {
                const mcl = this._mcl;
                await mclInitPromise; // ensure that mcl is initialized.
                mcl.setMapToMode(mcl.IRTF); // set the right map mode; otherwise mapToG2 will return wrong values.
                mcl.verifyOrderG1(1); // subgroup checks for G1
                mcl.verifyOrderG2(1); // subgroup checks for G2
            }
        }
        this._isInitialized = true;
    }
    /**
     * Processes blocks and adds them to the blockchain.
     *
     * This method modifies the state.
     *
     * @param blockchain -  A {@link Blockchain} object to process
     */
    async runBlockchain(blockchain, maxBlocks) {
        await this.init();
        return runBlockchain_1.default.bind(this)(blockchain, maxBlocks);
    }
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     *
     * This method modifies the state. If `generate` is `true`, the state modifications will be
     * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
     * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
     *
     * @param {RunBlockOpts} opts - Default values for options:
     *  - `generate`: false
     */
    async runBlock(opts) {
        await this.init();
        return runBlock_1.default.bind(this)(opts);
    }
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     *
     * @param {RunTxOpts} opts
     */
    async runTx(opts) {
        await this.init();
        return runTx_1.default.bind(this)(opts);
    }
    /**
     * runs a call (or create) operation.
     *
     * This method modifies the state.
     *
     * @param {RunCallOpts} opts
     */
    async runCall(opts) {
        await this.init();
        return runCall_1.default.bind(this)(opts);
    }
    /**
     * Runs EVM code.
     *
     * This method modifies the state.
     *
     * @param {RunCodeOpts} opts
     */
    async runCode(opts) {
        await this.init();
        return runCode_1.default.bind(this)(opts);
    }
    /**
     * Build a block on top of the current state
     * by adding one transaction at a time.
     *
     * Creates a checkpoint on the StateManager and modifies the state
     * as transactions are run. The checkpoint is committed on {@link BlockBuilder.build}
     * or discarded with {@link BlockBuilder.revert}.
     *
     * @param {BuildBlockOpts} opts
     * @returns An instance of {@link BlockBuilder} with methods:
     * - {@link BlockBuilder.addTransaction}
     * - {@link BlockBuilder.build}
     * - {@link BlockBuilder.revert}
     */
    async buildBlock(opts) {
        await this.init();
        return buildBlock_1.default.bind(this)(opts);
    }
    /**
     * Returns a list with the currently activated opcodes
     * available for VM execution
     */
    getActiveOpcodes() {
        return (0, opcodes_1.getOpcodesForHF)(this._common);
    }
    /**
     * Returns a copy of the {@link VM} instance.
     */
    copy() {
        return new VM({
            stateManager: this.stateManager.copy(),
            blockchain: this.blockchain.copy(),
            common: this._common.copy(),
        });
    }
    /**
     * Return a compact error string representation of the object
     */
    errorStr() {
        let hf = '';
        try {
            hf = this._common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        const errorStr = `vm hf=${hf}`;
        return errorStr;
    }
}
exports.default = VM;
//# sourceMappingURL=index.js.map
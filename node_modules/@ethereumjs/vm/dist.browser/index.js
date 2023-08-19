"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var merkle_patricia_tree_1 = require("merkle-patricia-tree");
var ethereumjs_util_1 = require("ethereumjs-util");
var blockchain_1 = __importDefault(require("@ethereumjs/blockchain"));
var common_1 = __importStar(require("@ethereumjs/common"));
var index_1 = require("./state/index");
var runCode_1 = __importDefault(require("./runCode"));
var runCall_1 = __importDefault(require("./runCall"));
var runTx_1 = __importDefault(require("./runTx"));
var runBlock_1 = __importDefault(require("./runBlock"));
var buildBlock_1 = __importDefault(require("./buildBlock"));
var opcodes_1 = require("./evm/opcodes");
var precompiles_1 = require("./evm/precompiles");
var runBlockchain_1 = __importDefault(require("./runBlockchain"));
var AsyncEventEmitter = require('async-eventemitter');
var util_1 = require("util");
// very ugly way to detect if we are running in a browser
var isBrowser = new Function('try {return this===window;}catch(e){ return false;}');
var mcl;
var mclInitPromise;
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
var VM = /** @class */ (function (_super) {
    __extends(VM, _super);
    /**
     * Instantiates a new {@link VM} Object.
     * @param opts
     */
    function VM(opts) {
        var e_1, _a;
        if (opts === void 0) { opts = {}; }
        var _b, _c, _d, _e;
        var _this = _super.call(this) || this;
        _this._isInitialized = false;
        /**
         * VM is run in DEBUG mode (default: false)
         * Taken from DEBUG environment variable
         *
         * Safeguards on debug() calls are added for
         * performance reasons to avoid string literal evaluation
         * @hidden
         */
        _this.DEBUG = false;
        _this._opts = opts;
        // Throw on chain or hardfork options removed in latest major release
        // to prevent implicit chain setup on a wrong chain
        if ('chain' in opts || 'hardfork' in opts) {
            throw new Error('Chain/hardfork options are not allowed any more on initialization');
        }
        if (opts.common) {
            //EIPs
            var supportedEIPs = [1559, 2315, 2537, 2565, 2718, 2929, 2930, 3198, 3529, 3541];
            try {
                for (var _f = __values(opts.common.eips()), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var eip = _g.value;
                    if (!supportedEIPs.includes(eip)) {
                        throw new Error(eip + " is not supported by the VM");
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_1) throw e_1.error; }
            }
            _this._common = opts.common;
        }
        else {
            var DEFAULT_CHAIN = common_1.Chain.Mainnet;
            var supportedHardforks = [
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
            _this._common = new common_1.default({
                chain: DEFAULT_CHAIN,
                supportedHardforks: supportedHardforks,
            });
        }
        _this._common.on('hardforkChanged', function () {
            _this._opcodes = (0, opcodes_1.getOpcodesForHF)(_this._common);
        });
        // Set list of opcodes based on HF
        // TODO: make this EIP-friendly
        _this._opcodes = (0, opcodes_1.getOpcodesForHF)(_this._common);
        if (opts.stateManager) {
            _this.stateManager = opts.stateManager;
        }
        else {
            var trie = (_b = opts.state) !== null && _b !== void 0 ? _b : new merkle_patricia_tree_1.SecureTrie();
            _this.stateManager = new index_1.DefaultStateManager({
                trie: trie,
                common: _this._common,
            });
        }
        _this.blockchain = (_c = opts.blockchain) !== null && _c !== void 0 ? _c : new blockchain_1.default({ common: _this._common });
        _this._allowUnlimitedContractSize = (_d = opts.allowUnlimitedContractSize) !== null && _d !== void 0 ? _d : false;
        if (opts.hardforkByBlockNumber !== undefined && opts.hardforkByTD !== undefined) {
            throw new Error("The hardforkByBlockNumber and hardforkByTD options can't be used in conjunction");
        }
        _this._hardforkByBlockNumber = (_e = opts.hardforkByBlockNumber) !== null && _e !== void 0 ? _e : false;
        _this._hardforkByTD = opts.hardforkByTD;
        if (_this._common.isActivatedEIP(2537)) {
            if (isBrowser()) {
                throw new Error('EIP-2537 is currently not supported in browsers');
            }
            else {
                _this._mcl = mcl;
            }
        }
        // Safeguard if "process" is not available (browser)
        if (process !== undefined && process.env.DEBUG) {
            _this.DEBUG = true;
        }
        // We cache this promisified function as it's called from the main execution loop, and
        // promisifying each time has a huge performance impact.
        _this._emit = (0, util_1.promisify)(_this.emit.bind(_this));
        return _this;
    }
    /**
     * VM async constructor. Creates engine instance and initializes it.
     *
     * @param opts VM engine constructor options
     */
    VM.create = function (opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var vm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vm = new this(opts);
                        return [4 /*yield*/, vm.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, vm];
                }
            });
        });
    };
    VM.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mcl_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._isInitialized) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.blockchain.initPromise];
                    case 1:
                        _a.sent();
                        if (!(this._opts.activatePrecompiles && !this._opts.stateManager)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.stateManager.checkpoint()
                            // put 1 wei in each of the precompiles in order to make the accounts non-empty and thus not have them deduct `callNewAccount` gas.
                        ];
                    case 2:
                        _a.sent();
                        // put 1 wei in each of the precompiles in order to make the accounts non-empty and thus not have them deduct `callNewAccount` gas.
                        return [4 /*yield*/, Promise.all(Object.keys(precompiles_1.precompiles)
                                .map(function (k) { return new ethereumjs_util_1.Address(Buffer.from(k, 'hex')); })
                                .map(function (address) { return __awaiter(_this, void 0, void 0, function () {
                                var account;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            account = ethereumjs_util_1.Account.fromAccountData({ balance: 1 });
                                            return [4 /*yield*/, this.stateManager.putAccount(address, account)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        // put 1 wei in each of the precompiles in order to make the accounts non-empty and thus not have them deduct `callNewAccount` gas.
                        _a.sent();
                        return [4 /*yield*/, this.stateManager.commit()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!this._common.isActivatedEIP(2537)) return [3 /*break*/, 8];
                        if (!isBrowser()) return [3 /*break*/, 6];
                        throw new Error('EIP-2537 is currently not supported in browsers');
                    case 6:
                        mcl_1 = this._mcl;
                        return [4 /*yield*/, mclInitPromise]; // ensure that mcl is initialized.
                    case 7:
                        _a.sent(); // ensure that mcl is initialized.
                        mcl_1.setMapToMode(mcl_1.IRTF); // set the right map mode; otherwise mapToG2 will return wrong values.
                        mcl_1.verifyOrderG1(1); // subgroup checks for G1
                        mcl_1.verifyOrderG2(1); // subgroup checks for G2
                        _a.label = 8;
                    case 8:
                        this._isInitialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Processes blocks and adds them to the blockchain.
     *
     * This method modifies the state.
     *
     * @param blockchain -  A {@link Blockchain} object to process
     */
    VM.prototype.runBlockchain = function (blockchain, maxBlocks) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runBlockchain_1.default.bind(this)(blockchain, maxBlocks)];
                }
            });
        });
    };
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
    VM.prototype.runBlock = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runBlock_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     *
     * @param {RunTxOpts} opts
     */
    VM.prototype.runTx = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runTx_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * runs a call (or create) operation.
     *
     * This method modifies the state.
     *
     * @param {RunCallOpts} opts
     */
    VM.prototype.runCall = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runCall_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * Runs EVM code.
     *
     * This method modifies the state.
     *
     * @param {RunCodeOpts} opts
     */
    VM.prototype.runCode = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, runCode_1.default.bind(this)(opts)];
                }
            });
        });
    };
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
    VM.prototype.buildBlock = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, buildBlock_1.default.bind(this)(opts)];
                }
            });
        });
    };
    /**
     * Returns a list with the currently activated opcodes
     * available for VM execution
     */
    VM.prototype.getActiveOpcodes = function () {
        return (0, opcodes_1.getOpcodesForHF)(this._common);
    };
    /**
     * Returns a copy of the {@link VM} instance.
     */
    VM.prototype.copy = function () {
        return new VM({
            stateManager: this.stateManager.copy(),
            blockchain: this.blockchain.copy(),
            common: this._common.copy(),
        });
    };
    /**
     * Return a compact error string representation of the object
     */
    VM.prototype.errorStr = function () {
        var hf = '';
        try {
            hf = this._common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        var errorStr = "vm hf=" + hf;
        return errorStr;
    };
    return VM;
}(AsyncEventEmitter));
exports.default = VM;
//# sourceMappingURL=index.js.map
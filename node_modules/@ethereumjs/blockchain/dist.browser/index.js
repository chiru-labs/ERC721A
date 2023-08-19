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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = require("debug");
var semaphore_async_await_1 = __importDefault(require("semaphore-async-await"));
var ethereumjs_util_1 = require("ethereumjs-util");
var block_1 = require("@ethereumjs/block");
var ethash_1 = __importDefault(require("@ethereumjs/ethash"));
var common_1 = __importStar(require("@ethereumjs/common"));
var manager_1 = require("./db/manager");
var helpers_1 = require("./db/helpers");
var operation_1 = require("./db/operation");
var clique_1 = require("./clique");
var debug = (0, debug_1.debug)('blockchain:clique');
var level = require('level-mem');
/**
 * This class stores and interacts with blocks.
 */
var Blockchain = /** @class */ (function () {
    /**
     * Creates new Blockchain object
     *
     * @deprecated - The direct usage of this constructor is discouraged since
     * non-finalized async initialization might lead to side effects. Please
     * use the async {@link Blockchain.create} constructor instead (same API).
     *
     * @param opts - An object with the options that this constructor takes. See
     * {@link BlockchainOptions}.
     */
    function Blockchain(opts) {
        if (opts === void 0) { opts = {}; }
        var _a, _b, _c;
        /**
         * Keep signer history data (signer states and votes)
         * for all block numbers >= HEAD_BLOCK - CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT
         *
         * This defines a limit for reorgs on PoA clique chains.
         */
        this.CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT = 100;
        /**
         * List with the latest signer states checkpointed on blocks where
         * a change (added new or removed a signer) occurred.
         *
         * Format:
         * [ [BLOCK_NUMBER_1, [SIGNER1, SIGNER 2,]], [BLOCK_NUMBER2, [SIGNER1, SIGNER3]], ...]
         *
         * The top element from the array represents the list of current signers.
         * On reorgs elements from the array are removed until BLOCK_NUMBER > REORG_BLOCK.
         *
         * Always keep at least one item on the stack.
         */
        this._cliqueLatestSignerStates = [];
        /**
         * List with the latest signer votes.
         *
         * Format:
         * [ [BLOCK_NUMBER_1, [SIGNER, BENEFICIARY, AUTH]], [BLOCK_NUMBER_1, [SIGNER, BENEFICIARY, AUTH]] ]
         * where AUTH = CLIQUE_NONCE_AUTH | CLIQUE_NONCE_DROP
         *
         * For votes all elements here must be taken into account with a
         * block number >= LAST_EPOCH_BLOCK
         * (nevertheless keep entries with blocks before EPOCH_BLOCK in case a reorg happens
         * during an epoch change)
         *
         * On reorgs elements from the array are removed until BLOCK_NUMBER > REORG_BLOCK.
         */
        this._cliqueLatestVotes = [];
        /**
         * List of signers for the last consecutive {@link Blockchain.cliqueSignerLimit} blocks.
         * Kept as a snapshot for quickly checking for "recently signed" error.
         * Format: [ [BLOCK_NUMBER, SIGNER_ADDRESS], ...]
         *
         * On reorgs elements from the array are removed until BLOCK_NUMBER > REORG_BLOCK.
         */
        this._cliqueLatestBlockSigners = [];
        // Throw on chain or hardfork options removed in latest major release to
        // prevent implicit chain setup on a wrong chain
        if ('chain' in opts || 'hardfork' in opts) {
            throw new Error('Chain/hardfork options are not allowed any more on initialization');
        }
        if (opts.common) {
            this._common = opts.common;
        }
        else {
            var DEFAULT_CHAIN = common_1.Chain.Mainnet;
            var DEFAULT_HARDFORK = common_1.Hardfork.Chainstart;
            this._common = new common_1.default({
                chain: DEFAULT_CHAIN,
                hardfork: DEFAULT_HARDFORK,
            });
        }
        this._hardforkByHeadBlockNumber = (_a = opts.hardforkByHeadBlockNumber) !== null && _a !== void 0 ? _a : false;
        this._validateConsensus = (_b = opts.validateConsensus) !== null && _b !== void 0 ? _b : true;
        this._validateBlocks = (_c = opts.validateBlocks) !== null && _c !== void 0 ? _c : true;
        this.db = opts.db ? opts.db : level();
        this.dbManager = new manager_1.DBManager(this.db, this._common);
        if (this._validateConsensus) {
            if (this._common.consensusType() === common_1.ConsensusType.ProofOfWork) {
                if (this._common.consensusAlgorithm() !== common_1.ConsensusAlgorithm.Ethash) {
                    throw new Error('consensus validation only supported for pow ethash algorithm');
                }
                else {
                    this._ethash = new ethash_1.default(this.db);
                }
            }
            if (this._common.consensusType() === common_1.ConsensusType.ProofOfAuthority) {
                if (this._common.consensusAlgorithm() !== common_1.ConsensusAlgorithm.Clique) {
                    throw new Error('consensus (signature) validation only supported for poa clique algorithm');
                }
            }
        }
        this._heads = {};
        this._lock = new semaphore_async_await_1.default(1);
        if (opts.genesisBlock && !opts.genesisBlock.isGenesis()) {
            throw 'supplied block is not a genesis block';
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.initPromise = this._init(opts.genesisBlock);
    }
    /**
     * Safe creation of a new Blockchain object awaiting the initialization function,
     * encouraged method to use when creating a blockchain object.
     *
     * @param opts Constructor options, see {@link BlockchainOptions}
     */
    Blockchain.create = function (opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var blockchain;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blockchain = new Blockchain(opts);
                        return [4 /*yield*/, blockchain.initPromise.catch(function (e) {
                                throw e;
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, blockchain];
                }
            });
        });
    };
    /**
     * Creates a blockchain from a list of block objects,
     * objects must be readable by {@link Block.fromBlockData}
     *
     * @param blockData List of block objects
     * @param opts Constructor options, see {@link BlockchainOptions}
     */
    Blockchain.fromBlocksData = function (blocksData, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var blockchain, blocksData_1, blocksData_1_1, blockData, block, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Blockchain.create(opts)];
                    case 1:
                        blockchain = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        blocksData_1 = __values(blocksData), blocksData_1_1 = blocksData_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!blocksData_1_1.done) return [3 /*break*/, 6];
                        blockData = blocksData_1_1.value;
                        block = block_1.Block.fromBlockData(blockData, {
                            common: blockchain._common,
                            hardforkByBlockNumber: true,
                        });
                        return [4 /*yield*/, blockchain.putBlock(block)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        blocksData_1_1 = blocksData_1.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (blocksData_1_1 && !blocksData_1_1.done && (_a = blocksData_1.return)) _a.call(blocksData_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/, blockchain];
                }
            });
        });
    };
    Object.defineProperty(Blockchain.prototype, "meta", {
        /**
         * Returns an object with metadata about the Blockchain. It's defined for
         * backwards compatibility.
         */
        get: function () {
            return {
                rawHead: this._headHeaderHash,
                heads: this._heads,
                genesis: this._genesis,
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a deep copy of this {@link Blockchain} instance.
     *
     * Note: this does not make a copy of the underlying db
     * since it is unknown if the source is on disk or in memory.
     * This should not be a significant issue in most usage since
     * the queries will only reflect the instance's known data.
     * If you would like this copied blockchain to use another db
     * set the {@link db} of this returned instance to a copy of
     * the original.
     */
    Blockchain.prototype.copy = function () {
        var copiedBlockchain = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        copiedBlockchain._common = this._common.copy();
        return copiedBlockchain;
    };
    /**
     * This method is called in the constructor and either sets up the DB or reads
     * values from the DB and makes these available to the consumers of
     * Blockchain.
     *
     * @hidden
     */
    Blockchain.prototype._init = function (genesisBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var dbGenesisBlock, genesisHash_1, error_1, common, genesisHash, dbOps_1, _a, _b, _c, heads, error_2, hash, error_3, hash, error_4, latestHeader, td;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.dbManager.numberToHash(new ethereumjs_util_1.BN(0))];
                    case 1:
                        genesisHash_1 = _d.sent();
                        return [4 /*yield*/, this.dbManager.getBlock(genesisHash_1)];
                    case 2:
                        dbGenesisBlock = _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        if (error_1.type !== 'NotFoundError') {
                            throw error_1;
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        if (!genesisBlock) {
                            common = this._common.copy();
                            common.setHardforkByBlockNumber(0);
                            genesisBlock = block_1.Block.genesis({}, { common: common });
                        }
                        // If the DB has a genesis block, then verify that the genesis block in the
                        // DB is indeed the Genesis block generated or assigned.
                        if (dbGenesisBlock && !genesisBlock.hash().equals(dbGenesisBlock.hash())) {
                            throw new Error('The genesis block in the DB has a different hash than the provided genesis block.');
                        }
                        genesisHash = genesisBlock.hash();
                        if (!!dbGenesisBlock) return [3 /*break*/, 7];
                        dbOps_1 = [];
                        dbOps_1.push((0, helpers_1.DBSetTD)(genesisBlock.header.difficulty.clone(), new ethereumjs_util_1.BN(0), genesisHash));
                        (0, helpers_1.DBSetBlockOrHeader)(genesisBlock).map(function (op) { return dbOps_1.push(op); });
                        (0, helpers_1.DBSaveLookups)(genesisHash, new ethereumjs_util_1.BN(0)).map(function (op) { return dbOps_1.push(op); });
                        return [4 /*yield*/, this.dbManager.batch(dbOps_1)];
                    case 5:
                        _d.sent();
                        if (!(this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.cliqueSaveGenesisSigners(genesisBlock)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        if (!(this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique)) return [3 /*break*/, 11];
                        _a = this;
                        return [4 /*yield*/, this.dbManager.getCliqueLatestSignerStates()];
                    case 8:
                        _a._cliqueLatestSignerStates = _d.sent();
                        _b = this;
                        return [4 /*yield*/, this.dbManager.getCliqueLatestVotes()];
                    case 9:
                        _b._cliqueLatestVotes = _d.sent();
                        _c = this;
                        return [4 /*yield*/, this.dbManager.getCliqueLatestBlockSigners()];
                    case 10:
                        _c._cliqueLatestBlockSigners = _d.sent();
                        _d.label = 11;
                    case 11:
                        // At this point, we can safely set genesisHash as the _genesis hash in this
                        // object: it is either the one we put in the DB, or it is equal to the one
                        // which we read from the DB.
                        this._genesis = genesisHash;
                        _d.label = 12;
                    case 12:
                        _d.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this.dbManager.getHeads()];
                    case 13:
                        heads = _d.sent();
                        this._heads = heads;
                        return [3 /*break*/, 15];
                    case 14:
                        error_2 = _d.sent();
                        if (error_2.type !== 'NotFoundError') {
                            throw error_2;
                        }
                        this._heads = {};
                        return [3 /*break*/, 15];
                    case 15:
                        _d.trys.push([15, 17, , 18]);
                        return [4 /*yield*/, this.dbManager.getHeadHeader()];
                    case 16:
                        hash = _d.sent();
                        this._headHeaderHash = hash;
                        return [3 /*break*/, 18];
                    case 17:
                        error_3 = _d.sent();
                        if (error_3.type !== 'NotFoundError') {
                            throw error_3;
                        }
                        this._headHeaderHash = genesisHash;
                        return [3 /*break*/, 18];
                    case 18:
                        _d.trys.push([18, 20, , 21]);
                        return [4 /*yield*/, this.dbManager.getHeadBlock()];
                    case 19:
                        hash = _d.sent();
                        this._headBlockHash = hash;
                        return [3 /*break*/, 21];
                    case 20:
                        error_4 = _d.sent();
                        if (error_4.type !== 'NotFoundError') {
                            throw error_4;
                        }
                        this._headBlockHash = genesisHash;
                        return [3 /*break*/, 21];
                    case 21:
                        if (!this._hardforkByHeadBlockNumber) return [3 /*break*/, 24];
                        return [4 /*yield*/, this._getHeader(this._headHeaderHash)];
                    case 22:
                        latestHeader = _d.sent();
                        return [4 /*yield*/, this.getTotalDifficulty(this._headHeaderHash)];
                    case 23:
                        td = _d.sent();
                        this._common.setHardforkByBlockNumber(latestHeader.number, td);
                        _d.label = 24;
                    case 24: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform the `action` function after we have initialized this module and
     * have acquired a lock
     * @param action - the action function to run after initializing and acquiring
     * a lock
     * @hidden
     */
    Blockchain.prototype.initAndLock = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initPromise];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.runWithLock(action)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Run a function after acquiring a lock. It is implied that we have already
     * initialized the module (or we are calling this from the init function, like
     * `_setCanonicalGenesisBlock`)
     * @param action - function to run after acquiring a lock
     * @hidden
     */
    Blockchain.prototype.runWithLock = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 3, 4]);
                        return [4 /*yield*/, this._lock.acquire()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, action()];
                    case 2:
                        value = _a.sent();
                        return [2 /*return*/, value];
                    case 3:
                        this._lock.release();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype._requireClique = function () {
        if (this._common.consensusAlgorithm() !== common_1.ConsensusAlgorithm.Clique) {
            throw new Error('Function call only supported for clique PoA networks');
        }
    };
    /**
     * Checks if signer was recently signed.
     * Returns true if signed too recently: more than once per {@link Blockchain.cliqueSignerLimit} consecutive blocks.
     * @param header BlockHeader
     * @hidden
     */
    Blockchain.prototype.cliqueCheckRecentlySigned = function (header) {
        if (header.isGenesis() || header.number.eqn(1)) {
            // skip genesis, first block
            return false;
        }
        var limit = this.cliqueSignerLimit();
        // construct recent block signers list with this block
        var signers = this._cliqueLatestBlockSigners;
        signers = signers.slice(signers.length < limit ? 0 : 1);
        signers.push([header.number, header.cliqueSigner()]);
        var seen = signers.filter(function (s) { return s[1].equals(header.cliqueSigner()); }).length;
        return seen > 1;
    };
    /**
     * Save genesis signers to db
     * @param genesisBlock genesis block
     * @hidden
     */
    Blockchain.prototype.cliqueSaveGenesisSigners = function (genesisBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var genesisSignerState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        genesisSignerState = [
                            new ethereumjs_util_1.BN(0),
                            genesisBlock.header.cliqueEpochTransitionSigners(),
                        ];
                        return [4 /*yield*/, this.cliqueUpdateSignerStates(genesisSignerState)];
                    case 1:
                        _a.sent();
                        debug("[Block 0] Genesis block -> update signer states");
                        return [4 /*yield*/, this.cliqueUpdateVotes()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save signer state to db
     * @param signerState
     * @hidden
     */
    Blockchain.prototype.cliqueUpdateSignerStates = function (signerState) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dbOps, limit, blockSigners, lastBlockNumber, blockLimit_1, states, lastItem, formatted, i, _b, _c, signer;
            var e_2, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        dbOps = [];
                        if (signerState) {
                            this._cliqueLatestSignerStates.push(signerState);
                        }
                        limit = this.CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT;
                        blockSigners = this._cliqueLatestBlockSigners;
                        lastBlockNumber = (_a = blockSigners[blockSigners.length - 1]) === null || _a === void 0 ? void 0 : _a[0];
                        if (lastBlockNumber) {
                            blockLimit_1 = lastBlockNumber.subn(limit);
                            states = this._cliqueLatestSignerStates;
                            lastItem = states[states.length - 1];
                            this._cliqueLatestSignerStates = states.filter(function (state) { return state[0].gte(blockLimit_1); });
                            if (this._cliqueLatestSignerStates.length === 0) {
                                // always keep at least one item on the stack
                                this._cliqueLatestSignerStates.push(lastItem);
                            }
                        }
                        formatted = this._cliqueLatestSignerStates.map(function (state) { return [
                            state[0].toArrayLike(Buffer),
                            state[1].map(function (a) { return a.toBuffer(); }),
                        ]; });
                        dbOps.push(helpers_1.DBOp.set(operation_1.DBTarget.CliqueSignerStates, ethereumjs_util_1.rlp.encode(formatted)));
                        return [4 /*yield*/, this.dbManager.batch(dbOps)
                            // Output active signers for debugging purposes
                        ];
                    case 1:
                        _e.sent();
                        i = 0;
                        try {
                            for (_b = __values(this.cliqueActiveSigners()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                signer = _c.value;
                                debug("Clique signer [" + i + "]: " + signer);
                                i++;
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update clique votes and save to db
     * @param header BlockHeader
     * @hidden
     */
    Blockchain.prototype.cliqueUpdateVotes = function (header) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var signer_1, beneficiary_1, nonce, latestVote, _loop_1, this_1, round, state_1, limit, blockSigners, lastBlockNumber, lastEpochBlockNumber, blockLimit_2, dbOps, formatted;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(header && !header.coinbase.isZero())) return [3 /*break*/, 4];
                        signer_1 = header.cliqueSigner();
                        beneficiary_1 = header.coinbase;
                        nonce = header.nonce;
                        latestVote = [header.number, [signer_1, beneficiary_1, nonce]];
                        _loop_1 = function (round) {
                            var lastEpochBlockNumber, limit_1, activeSigners, consensus, votes, beneficiaryVotesAUTH, _loop_2, votes_1, votes_1_1, vote, numBeneficiaryVotesAUTH, beneficiaryVotesDROP, _loop_3, votes_2, votes_2_1, vote, numBeneficiaryVotesDROP, newSignerState;
                            var e_3, _c, e_4, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        lastEpochBlockNumber = header.number.sub(header.number.mod(new ethereumjs_util_1.BN(this_1._common.consensusConfig().epoch)));
                                        limit_1 = this_1.cliqueSignerLimit();
                                        activeSigners = this_1.cliqueActiveSigners();
                                        consensus = false;
                                        votes = this_1._cliqueLatestVotes.filter(function (vote) {
                                            return (vote[0].gte(lastEpochBlockNumber) &&
                                                !vote[1][0].equals(signer_1) &&
                                                vote[1][1].equals(beneficiary_1) &&
                                                vote[1][2].equals(clique_1.CLIQUE_NONCE_AUTH));
                                        });
                                        beneficiaryVotesAUTH = [];
                                        _loop_2 = function (vote) {
                                            var num = beneficiaryVotesAUTH.filter(function (voteCMP) {
                                                return voteCMP.equals(vote[1][0]);
                                            }).length;
                                            if (num === 0) {
                                                beneficiaryVotesAUTH.push(vote[1][0]);
                                            }
                                        };
                                        try {
                                            for (votes_1 = (e_3 = void 0, __values(votes)), votes_1_1 = votes_1.next(); !votes_1_1.done; votes_1_1 = votes_1.next()) {
                                                vote = votes_1_1.value;
                                                _loop_2(vote);
                                            }
                                        }
                                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                        finally {
                                            try {
                                                if (votes_1_1 && !votes_1_1.done && (_c = votes_1.return)) _c.call(votes_1);
                                            }
                                            finally { if (e_3) throw e_3.error; }
                                        }
                                        numBeneficiaryVotesAUTH = beneficiaryVotesAUTH.length;
                                        if (round === 2 && nonce.equals(clique_1.CLIQUE_NONCE_AUTH)) {
                                            numBeneficiaryVotesAUTH += 1;
                                        }
                                        // Majority consensus
                                        if (numBeneficiaryVotesAUTH >= limit_1) {
                                            consensus = true;
                                            // Authorize new signer
                                            activeSigners.push(beneficiary_1);
                                            activeSigners.sort(function (a, b) {
                                                // Sort by buffer size
                                                return a.toBuffer().compare(b.toBuffer());
                                            });
                                            // Discard votes for added signer
                                            this_1._cliqueLatestVotes = this_1._cliqueLatestVotes.filter(function (vote) { return !vote[1][1].equals(beneficiary_1); });
                                            debug("[Block " + header.number + "] Clique majority consensus (AUTH " + beneficiary_1 + ")");
                                        }
                                        // DROP vote
                                        votes = this_1._cliqueLatestVotes.filter(function (vote) {
                                            return (vote[0].gte(lastEpochBlockNumber) &&
                                                !vote[1][0].equals(signer_1) &&
                                                vote[1][1].equals(beneficiary_1) &&
                                                vote[1][2].equals(clique_1.CLIQUE_NONCE_DROP));
                                        });
                                        beneficiaryVotesDROP = [];
                                        _loop_3 = function (vote) {
                                            var num = beneficiaryVotesDROP.filter(function (voteCMP) {
                                                return voteCMP.equals(vote[1][0]);
                                            }).length;
                                            if (num === 0) {
                                                beneficiaryVotesDROP.push(vote[1][0]);
                                            }
                                        };
                                        try {
                                            for (votes_2 = (e_4 = void 0, __values(votes)), votes_2_1 = votes_2.next(); !votes_2_1.done; votes_2_1 = votes_2.next()) {
                                                vote = votes_2_1.value;
                                                _loop_3(vote);
                                            }
                                        }
                                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                                        finally {
                                            try {
                                                if (votes_2_1 && !votes_2_1.done && (_d = votes_2.return)) _d.call(votes_2);
                                            }
                                            finally { if (e_4) throw e_4.error; }
                                        }
                                        numBeneficiaryVotesDROP = beneficiaryVotesDROP.length;
                                        if (round === 2 && nonce.equals(clique_1.CLIQUE_NONCE_DROP)) {
                                            numBeneficiaryVotesDROP += 1;
                                        }
                                        // Majority consensus
                                        if (numBeneficiaryVotesDROP >= limit_1) {
                                            consensus = true;
                                            // Drop signer
                                            activeSigners = activeSigners.filter(function (signer) { return !signer.equals(beneficiary_1); });
                                            this_1._cliqueLatestVotes = this_1._cliqueLatestVotes.filter(
                                            // Discard votes from removed signer and for removed signer
                                            function (vote) { return !vote[1][0].equals(beneficiary_1) && !vote[1][1].equals(beneficiary_1); });
                                            debug("[Block " + header.number + "] Clique majority consensus (DROP " + beneficiary_1 + ")");
                                        }
                                        if (round === 1) {
                                            // Always add the latest vote to the history no matter if already voted
                                            // the same vote or not
                                            this_1._cliqueLatestVotes.push(latestVote);
                                            debug("[Block " + header.number + "] New clique vote: " + signer_1 + " -> " + beneficiary_1 + " " + (nonce.equals(clique_1.CLIQUE_NONCE_AUTH) ? 'AUTH' : 'DROP'));
                                        }
                                        if (!consensus) return [3 /*break*/, 2];
                                        if (round === 1) {
                                            debug("[Block " + header.number + "] Clique majority consensus on existing votes -> update signer states");
                                        }
                                        else {
                                            debug("[Block " + header.number + "] Clique majority consensus on new vote -> update signer states");
                                        }
                                        newSignerState = [header.number, activeSigners];
                                        return [4 /*yield*/, this_1.cliqueUpdateSignerStates(newSignerState)];
                                    case 1:
                                        _e.sent();
                                        return [2 /*return*/, { value: void 0 }];
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        round = 1;
                        _b.label = 1;
                    case 1:
                        if (!(round <= 2)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(round)];
                    case 2:
                        state_1 = _b.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _b.label = 3;
                    case 3:
                        round++;
                        return [3 /*break*/, 1];
                    case 4:
                        limit = this.CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT;
                        blockSigners = this._cliqueLatestBlockSigners;
                        lastBlockNumber = (_a = blockSigners[blockSigners.length - 1]) === null || _a === void 0 ? void 0 : _a[0];
                        if (lastBlockNumber) {
                            lastEpochBlockNumber = lastBlockNumber.sub(lastBlockNumber.mod(new ethereumjs_util_1.BN(this._common.consensusConfig().epoch)));
                            blockLimit_2 = lastEpochBlockNumber.subn(limit);
                            this._cliqueLatestVotes = this._cliqueLatestVotes.filter(function (state) { return state[0].gte(blockLimit_2); });
                        }
                        dbOps = [];
                        formatted = this._cliqueLatestVotes.map(function (v) { return [
                            v[0].toArrayLike(Buffer),
                            [v[1][0].toBuffer(), v[1][1].toBuffer(), v[1][2]],
                        ]; });
                        dbOps.push(helpers_1.DBOp.set(operation_1.DBTarget.CliqueVotes, ethereumjs_util_1.rlp.encode(formatted)));
                        return [4 /*yield*/, this.dbManager.batch(dbOps)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update snapshot of latest clique block signers.
     * Used for checking for 'recently signed' error.
     * Length trimmed to {@link Blockchain.cliqueSignerLimit}.
     * @param header BlockHeader
     * @hidden
     */
    Blockchain.prototype.cliqueUpdateLatestBlockSigners = function (header) {
        return __awaiter(this, void 0, void 0, function () {
            var dbOps, signer, length_1, limit, formatted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbOps = [];
                        if (header) {
                            if (header.isGenesis()) {
                                return [2 /*return*/];
                            }
                            signer = [header.number, header.cliqueSigner()];
                            this._cliqueLatestBlockSigners.push(signer);
                            length_1 = this._cliqueLatestBlockSigners.length;
                            limit = this.cliqueSignerLimit();
                            if (length_1 > limit) {
                                this._cliqueLatestBlockSigners = this._cliqueLatestBlockSigners.slice(length_1 - limit, length_1);
                            }
                        }
                        formatted = this._cliqueLatestBlockSigners.map(function (b) { return [
                            b[0].toArrayLike(Buffer),
                            b[1].toBuffer(),
                        ]; });
                        dbOps.push(helpers_1.DBOp.set(operation_1.DBTarget.CliqueBlockSigners, ethereumjs_util_1.rlp.encode(formatted)));
                        return [4 /*yield*/, this.dbManager.batch(dbOps)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns a list with the current block signers
     * (only clique PoA, throws otherwise)
     */
    Blockchain.prototype.cliqueActiveSigners = function () {
        this._requireClique();
        var signers = this._cliqueLatestSignerStates;
        if (signers.length === 0) {
            return [];
        }
        return __spreadArray([], __read(signers[signers.length - 1][1]), false);
    };
    /**
     * Number of consecutive blocks out of which a signer may only sign one.
     * Defined as `Math.floor(SIGNER_COUNT / 2) + 1` to enforce majority consensus.
     * signer count -> signer limit:
     *   1 -> 1, 2 -> 2, 3 -> 2, 4 -> 2, 5 -> 3, ...
     * @hidden
     */
    Blockchain.prototype.cliqueSignerLimit = function () {
        return Math.floor(this.cliqueActiveSigners().length / 2) + 1;
    };
    /**
     * Returns the specified iterator head.
     *
     * This function replaces the old {@link Blockchain.getHead} method. Note that
     * the function deviates from the old behavior and returns the
     * genesis hash instead of the current head block if an iterator
     * has not been run. This matches the behavior of {@link Blockchain.iterator}.
     *
     * @param name - Optional name of the iterator head (default: 'vm')
     */
    Blockchain.prototype.getIteratorHead = function (name) {
        if (name === void 0) { name = 'vm'; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            var hash, block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        hash = this._heads[name] || this._genesis;
                                        if (!hash) {
                                            throw new Error('No head found.');
                                        }
                                        return [4 /*yield*/, this._getBlock(hash)];
                                    case 1:
                                        block = _a.sent();
                                        return [2 /*return*/, block];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns the specified iterator head.
     *
     * @param name - Optional name of the iterator head (default: 'vm')
     *
     * @deprecated use {@link Blockchain.getIteratorHead} instead.
     * Note that {@link Blockchain.getIteratorHead} doesn't return
     * the `headHeader` but the genesis hash as an initial iterator
     * head value (now matching the behavior of {@link Blockchain.iterator}
     * on a first run)
     */
    Blockchain.prototype.getHead = function (name) {
        if (name === void 0) { name = 'vm'; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            var hash, block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        hash = this._heads[name] || this._headBlockHash;
                                        if (!hash) {
                                            throw new Error('No head found.');
                                        }
                                        return [4 /*yield*/, this._getBlock(hash)];
                                    case 1:
                                        block = _a.sent();
                                        return [2 /*return*/, block];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns the latest header in the canonical chain.
     */
    Blockchain.prototype.getLatestHeader = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            var block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this._headHeaderHash) {
                                            throw new Error('No head header set');
                                        }
                                        return [4 /*yield*/, this._getBlock(this._headHeaderHash)];
                                    case 1:
                                        block = _a.sent();
                                        return [2 /*return*/, block.header];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns the latest full block in the canonical chain.
     */
    Blockchain.prototype.getLatestBlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                        var block;
                        return __generator(this, function (_a) {
                            if (!this._headBlockHash) {
                                throw new Error('No head block set');
                            }
                            block = this._getBlock(this._headBlockHash);
                            return [2 /*return*/, block];
                        });
                    }); })];
            });
        });
    };
    /**
     * Adds blocks to the blockchain.
     *
     * If an invalid block is met the function will throw, blocks before will
     * nevertheless remain in the DB. If any of the saved blocks has a higher
     * total difficulty than the current max total difficulty the canonical
     * chain is rebuilt and any stale heads/hashes are overwritten.
     * @param blocks - The blocks to be added to the blockchain
     */
    Blockchain.prototype.putBlocks = function (blocks) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initPromise];
                    case 1:
                        _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < blocks.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.putBlock(blocks[i])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Adds a block to the blockchain.
     *
     * If the block is valid and has a higher total difficulty than the current
     * max total difficulty, the canonical chain is rebuilt and any stale
     * heads/hashes are overwritten.
     * @param block - The block to be added to the blockchain
     */
    Blockchain.prototype.putBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initPromise];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._putBlockOrHeader(block)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Adds many headers to the blockchain.
     *
     * If an invalid header is met the function will throw, headers before will
     * nevertheless remain in the DB. If any of the saved headers has a higher
     * total difficulty than the current max total difficulty the canonical
     * chain is rebuilt and any stale heads/hashes are overwritten.
     * @param headers - The headers to be added to the blockchain
     */
    Blockchain.prototype.putHeaders = function (headers) {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initPromise];
                    case 1:
                        _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < headers.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.putHeader(headers[i])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Adds a header to the blockchain.
     *
     * If this header is valid and it has a higher total difficulty than the current
     * max total difficulty, the canonical chain is rebuilt and any stale
     * heads/hashes are overwritten.
     * @param header - The header to be added to the blockchain
     */
    Blockchain.prototype.putHeader = function (header) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initPromise];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._putBlockOrHeader(header)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Entrypoint for putting any block or block header. Verifies this block,
     * checks the total TD: if this TD is higher than the current highest TD, we
     * have thus found a new canonical block and have to rewrite the canonical
     * chain. This also updates the head block hashes. If any of the older known
     * canonical chains just became stale, then we also reset every _heads header
     * which points to a stale header to the last verified header which was in the
     * old canonical chain, but also in the new canonical chain. This thus rolls
     * back these headers so that these can be updated to the "new" canonical
     * header using the iterator method.
     * @hidden
     */
    Blockchain.prototype._putBlockOrHeader = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runWithLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            var block, isGenesis, isHeader, header, blockHash, blockNumber, td, currentTd, dbOps, valid, valid, checkpointSigners, activeSigners, _a, _b, _c, i, cSigner, _d, _e, parentTd, ancientHeaderNumber, ops, number, canonicalHeader;
                            var e_5, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        block = item instanceof block_1.BlockHeader
                                            ? new block_1.Block(item, undefined, undefined, {
                                                common: item._common,
                                            })
                                            : item;
                                        isGenesis = block.isGenesis();
                                        isHeader = item instanceof block_1.BlockHeader;
                                        // we cannot overwrite the Genesis block after initializing the Blockchain
                                        if (isGenesis) {
                                            throw new Error('Cannot put a genesis block: create a new Blockchain');
                                        }
                                        header = block.header;
                                        blockHash = header.hash();
                                        blockNumber = header.number;
                                        td = header.difficulty.clone();
                                        currentTd = { header: new ethereumjs_util_1.BN(0), block: new ethereumjs_util_1.BN(0) };
                                        dbOps = [];
                                        if (!block._common.chainIdBN().eq(this._common.chainIdBN())) {
                                            throw new Error('Chain mismatch while trying to put block or header');
                                        }
                                        if (!(this._validateBlocks && !isGenesis)) return [3 /*break*/, 2];
                                        // this calls into `getBlock`, which is why we cannot lock yet
                                        return [4 /*yield*/, block.validate(this, isHeader)];
                                    case 1:
                                        // this calls into `getBlock`, which is why we cannot lock yet
                                        _g.sent();
                                        _g.label = 2;
                                    case 2:
                                        if (!this._validateConsensus) return [3 /*break*/, 5];
                                        if (!(this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Ethash)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, this._ethash.verifyPOW(block)];
                                    case 3:
                                        valid = _g.sent();
                                        if (!valid) {
                                            throw new Error('invalid POW');
                                        }
                                        _g.label = 4;
                                    case 4:
                                        if (this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique) {
                                            valid = header.cliqueVerifySignature(this.cliqueActiveSigners());
                                            if (!valid) {
                                                throw new Error('invalid PoA block signature (clique)');
                                            }
                                            if (this.cliqueCheckRecentlySigned(header)) {
                                                throw new Error('recently signed');
                                            }
                                        }
                                        _g.label = 5;
                                    case 5:
                                        if (this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique) {
                                            // validate checkpoint signers towards active signers on epoch transition blocks
                                            if (header.cliqueIsEpochTransition()) {
                                                checkpointSigners = header.cliqueEpochTransitionSigners();
                                                activeSigners = this.cliqueActiveSigners();
                                                try {
                                                    for (_a = __values(checkpointSigners.entries()), _b = _a.next(); !_b.done; _b = _a.next()) {
                                                        _c = __read(_b.value, 2), i = _c[0], cSigner = _c[1];
                                                        if (!activeSigners[i] || !activeSigners[i].equals(cSigner)) {
                                                            throw new Error("checkpoint signer not found in active signers list at index " + i + ": " + cSigner);
                                                        }
                                                    }
                                                }
                                                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                                finally {
                                                    try {
                                                        if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                                                    }
                                                    finally { if (e_5) throw e_5.error; }
                                                }
                                            }
                                        }
                                        if (!this._headHeaderHash) return [3 /*break*/, 7];
                                        _d = currentTd;
                                        return [4 /*yield*/, this.getTotalDifficulty(this._headHeaderHash)];
                                    case 6:
                                        _d.header = _g.sent();
                                        _g.label = 7;
                                    case 7:
                                        if (!this._headBlockHash) return [3 /*break*/, 9];
                                        _e = currentTd;
                                        return [4 /*yield*/, this.getTotalDifficulty(this._headBlockHash)];
                                    case 8:
                                        _e.block = _g.sent();
                                        _g.label = 9;
                                    case 9:
                                        parentTd = new ethereumjs_util_1.BN(0);
                                        if (!!block.isGenesis()) return [3 /*break*/, 11];
                                        return [4 /*yield*/, this.getTotalDifficulty(header.parentHash, blockNumber.subn(1))];
                                    case 10:
                                        parentTd = _g.sent();
                                        _g.label = 11;
                                    case 11:
                                        td.iadd(parentTd);
                                        // save total difficulty to the database
                                        dbOps = dbOps.concat((0, helpers_1.DBSetTD)(td, blockNumber, blockHash));
                                        // save header/block to the database
                                        dbOps = dbOps.concat((0, helpers_1.DBSetBlockOrHeader)(block));
                                        if (!(block.isGenesis() ||
                                            (block._common.consensusType() !== common_1.ConsensusType.ProofOfStake && td.gt(currentTd.header)) ||
                                            block._common.consensusType() === common_1.ConsensusType.ProofOfStake)) return [3 /*break*/, 16];
                                        if (!(this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique)) return [3 /*break*/, 13];
                                        return [4 /*yield*/, this._findAncient(header)];
                                    case 12:
                                        ancientHeaderNumber = (_g.sent()).number;
                                        _g.label = 13;
                                    case 13:
                                        this._headHeaderHash = blockHash;
                                        if (item instanceof block_1.Block) {
                                            this._headBlockHash = blockHash;
                                        }
                                        if (this._hardforkByHeadBlockNumber) {
                                            this._common.setHardforkByBlockNumber(blockNumber, td);
                                        }
                                        // TODO SET THIS IN CONSTRUCTOR
                                        if (block.isGenesis()) {
                                            this._genesis = blockHash;
                                        }
                                        // delete higher number assignments and overwrite stale canonical chain
                                        return [4 /*yield*/, this._deleteCanonicalChainReferences(blockNumber.addn(1), blockHash, dbOps)
                                            // from the current header block, check the blockchain in reverse (i.e.
                                            // traverse `parentHash`) until `numberToHash` matches the current
                                            // number/hash in the canonical chain also: overwrite any heads if these
                                            // heads are stale in `_heads` and `_headBlockHash`
                                        ];
                                    case 14:
                                        // delete higher number assignments and overwrite stale canonical chain
                                        _g.sent();
                                        // from the current header block, check the blockchain in reverse (i.e.
                                        // traverse `parentHash`) until `numberToHash` matches the current
                                        // number/hash in the canonical chain also: overwrite any heads if these
                                        // heads are stale in `_heads` and `_headBlockHash`
                                        return [4 /*yield*/, this._rebuildCanonical(header, dbOps)];
                                    case 15:
                                        // from the current header block, check the blockchain in reverse (i.e.
                                        // traverse `parentHash`) until `numberToHash` matches the current
                                        // number/hash in the canonical chain also: overwrite any heads if these
                                        // heads are stale in `_heads` and `_headBlockHash`
                                        _g.sent();
                                        return [3 /*break*/, 17];
                                    case 16:
                                        // the TD is lower than the current highest TD so we will add the block
                                        // to the DB, but will not mark it as the canonical chain.
                                        if (td.gt(currentTd.block) && item instanceof block_1.Block) {
                                            this._headBlockHash = blockHash;
                                        }
                                        // save hash to number lookup info even if rebuild not needed
                                        dbOps.push((0, helpers_1.DBSetHashToNumber)(blockHash, blockNumber));
                                        _g.label = 17;
                                    case 17:
                                        ops = dbOps.concat(this._saveHeadOps());
                                        return [4 /*yield*/, this.dbManager.batch(ops)
                                            // Clique: update signer votes and state
                                        ];
                                    case 18:
                                        _g.sent();
                                        if (!(this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique && ancientHeaderNumber)) return [3 /*break*/, 24];
                                        return [4 /*yield*/, this._cliqueDeleteSnapshots(ancientHeaderNumber.addn(1))];
                                    case 19:
                                        _g.sent();
                                        number = ancientHeaderNumber.addn(1);
                                        _g.label = 20;
                                    case 20:
                                        if (!number.lte(header.number)) return [3 /*break*/, 24];
                                        return [4 /*yield*/, this._getCanonicalHeader(number)];
                                    case 21:
                                        canonicalHeader = _g.sent();
                                        return [4 /*yield*/, this._cliqueBuildSnapshots(canonicalHeader)];
                                    case 22:
                                        _g.sent();
                                        _g.label = 23;
                                    case 23:
                                        number.iaddn(1);
                                        return [3 /*break*/, 20];
                                    case 24: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets a block by its hash.
     *
     * @param blockId - The block's hash or number. If a hash is provided, then
     * this will be immediately looked up, otherwise it will wait until we have
     * unlocked the DB
     */
    Blockchain.prototype.getBlock = function (blockId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // cannot wait for a lock here: it is used both in `validate` of `Block`
                    // (calls `getBlock` to get `parentHash`) it is also called from `runBlock`
                    // in the `VM` if we encounter a `BLOCKHASH` opcode: then a BN is used we
                    // need to then read the block from the canonical chain Q: is this safe? We
                    // know it is OK if we call it from the iterator... (runBlock)
                    return [4 /*yield*/, this.initPromise];
                    case 1:
                        // cannot wait for a lock here: it is used both in `validate` of `Block`
                        // (calls `getBlock` to get `parentHash`) it is also called from `runBlock`
                        // in the `VM` if we encounter a `BLOCKHASH` opcode: then a BN is used we
                        // need to then read the block from the canonical chain Q: is this safe? We
                        // know it is OK if we call it from the iterator... (runBlock)
                        _a.sent();
                        return [4 /*yield*/, this._getBlock(blockId)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @hidden
     */
    Blockchain.prototype._getBlock = function (blockId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.dbManager.getBlock(blockId)];
            });
        });
    };
    /**
     * Gets total difficulty for a block specified by hash and number
     */
    Blockchain.prototype.getTotalDifficulty = function (hash, number) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!number) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dbManager.hashToNumber(hash)];
                    case 1:
                        number = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.dbManager.getTotalDifficulty(hash, number)];
                }
            });
        });
    };
    /**
     * Looks up many blocks relative to blockId Note: due to `GetBlockHeaders
     * (0x03)` (ETH wire protocol) we have to support skip/reverse as well.
     * @param blockId - The block's hash or number
     * @param maxBlocks - Max number of blocks to return
     * @param skip - Number of blocks to skip apart
     * @param reverse - Fetch blocks in reverse
     */
    Blockchain.prototype.getBlocks = function (blockId, maxBlocks, skip, reverse) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            var blocks, i, nextBlock;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        blocks = [];
                                        i = -1;
                                        nextBlock = function (blockId) { return __awaiter(_this, void 0, void 0, function () {
                                            var block, error_5, nextBlockNumber;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, this._getBlock(blockId)];
                                                    case 1:
                                                        block = _a.sent();
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        error_5 = _a.sent();
                                                        if (error_5.type !== 'NotFoundError') {
                                                            throw error_5;
                                                        }
                                                        return [2 /*return*/];
                                                    case 3:
                                                        i++;
                                                        nextBlockNumber = block.header.number.addn(reverse ? -1 : 1);
                                                        if (!(i !== 0 && skip && i % (skip + 1) !== 0)) return [3 /*break*/, 5];
                                                        return [4 /*yield*/, nextBlock(nextBlockNumber)];
                                                    case 4: return [2 /*return*/, _a.sent()];
                                                    case 5:
                                                        blocks.push(block);
                                                        if (!(blocks.length < maxBlocks)) return [3 /*break*/, 7];
                                                        return [4 /*yield*/, nextBlock(nextBlockNumber)];
                                                    case 6:
                                                        _a.sent();
                                                        _a.label = 7;
                                                    case 7: return [2 /*return*/];
                                                }
                                            });
                                        }); };
                                        return [4 /*yield*/, nextBlock(blockId)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, blocks];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Given an ordered array, returns an array of hashes that are not in the
     * blockchain yet. Uses binary search to find out what hashes are missing.
     * Therefore, the array needs to be ordered upon number.
     * @param hashes - Ordered array of hashes (ordered on `number`).
     */
    Blockchain.prototype.selectNeededHashes = function (hashes) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            var max, mid, min, number, error_6;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        max = hashes.length - 1;
                                        mid = min = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!(max >= min)) return [3 /*break*/, 6];
                                        number = void 0;
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 4, , 5]);
                                        return [4 /*yield*/, this.dbManager.hashToNumber(hashes[mid])];
                                    case 3:
                                        number = _a.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        error_6 = _a.sent();
                                        if (error_6.type !== 'NotFoundError') {
                                            throw error_6;
                                        }
                                        return [3 /*break*/, 5];
                                    case 5:
                                        if (number) {
                                            min = mid + 1;
                                        }
                                        else {
                                            max = mid - 1;
                                        }
                                        mid = Math.floor((min + max) / 2);
                                        return [3 /*break*/, 1];
                                    case 6: return [2 /*return*/, hashes.slice(min)];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Completely deletes a block from the blockchain including any references to
     * this block. If this block was in the canonical chain, then also each child
     * block of this block is deleted Also, if this was a canonical block, each
     * head header which is part of this now stale chain will be set to the
     * parentHeader of this block An example reason to execute is when running the
     * block in the VM invalidates this block: this will then reset the canonical
     * head to the past block (which has been validated in the past by the VM, so
     * we can be sure it is correct).
     * @param blockHash - The hash of the block to be deleted
     */
    Blockchain.prototype.delBlock = function (blockHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Q: is it safe to make this not wait for a lock? this is called from
                    // `runBlockchain` in case `runBlock` throws (i.e. the block is invalid).
                    // But is this the way to go? If we know this is called from the
                    // iterator/runBlockchain we are safe, but if this is called from anywhere
                    // else then this might lead to a concurrency problem?
                    return [4 /*yield*/, this.initPromise];
                    case 1:
                        // Q: is it safe to make this not wait for a lock? this is called from
                        // `runBlockchain` in case `runBlock` throws (i.e. the block is invalid).
                        // But is this the way to go? If we know this is called from the
                        // iterator/runBlockchain we are safe, but if this is called from anywhere
                        // else then this might lead to a concurrency problem?
                        _a.sent();
                        return [4 /*yield*/, this._delBlock(blockHash)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @hidden
     */
    Blockchain.prototype._delBlock = function (blockHash) {
        return __awaiter(this, void 0, void 0, function () {
            var dbOps, header, blockHeader, blockNumber, parentHash, canonicalHash, inCanonical;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbOps = [];
                        return [4 /*yield*/, this._getHeader(blockHash)];
                    case 1:
                        header = _a.sent();
                        blockHeader = header;
                        blockNumber = blockHeader.number;
                        parentHash = blockHeader.parentHash;
                        return [4 /*yield*/, this.safeNumberToHash(blockNumber)];
                    case 2:
                        canonicalHash = _a.sent();
                        inCanonical = !!canonicalHash && canonicalHash.equals(blockHash);
                        // delete the block, and if block is in the canonical chain, delete all
                        // children as well
                        return [4 /*yield*/, this._delChild(blockHash, blockNumber, inCanonical ? parentHash : null, dbOps)
                            // delete all number to hash mappings for deleted block number and above
                        ];
                    case 3:
                        // delete the block, and if block is in the canonical chain, delete all
                        // children as well
                        _a.sent();
                        if (!inCanonical) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._deleteCanonicalChainReferences(blockNumber, parentHash, dbOps)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.dbManager.batch(dbOps)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates the `DatabaseOperation` list to delete a block from the DB,
     * identified by `blockHash` and `blockNumber`. Deletes fields from `Header`,
     * `Body`, `HashToNumber` and `TotalDifficulty` tables. If child blocks of
     * this current block are in the canonical chain, delete these as well. Does
     * not actually commit these changes to the DB. Sets `_headHeaderHash` and
     * `_headBlockHash` to `headHash` if any of these matches the current child to
     * be deleted.
     * @param blockHash - the block hash to delete
     * @param blockNumber - the number corresponding to the block hash
     * @param headHash - the current head of the chain (if null, do not update
     * `_headHeaderHash` and `_headBlockHash`)
     * @param ops - the `DatabaseOperation` list to add the delete operations to
     * @hidden
     */
    Blockchain.prototype._delChild = function (blockHash, blockNumber, headHash, ops) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var childHeader, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // delete header, body, hash to number mapping and td
                        ops.push(helpers_1.DBOp.del(operation_1.DBTarget.Header, { blockHash: blockHash, blockNumber: blockNumber }));
                        ops.push(helpers_1.DBOp.del(operation_1.DBTarget.Body, { blockHash: blockHash, blockNumber: blockNumber }));
                        ops.push(helpers_1.DBOp.del(operation_1.DBTarget.HashToNumber, { blockHash: blockHash }));
                        ops.push(helpers_1.DBOp.del(operation_1.DBTarget.TotalDifficulty, { blockHash: blockHash, blockNumber: blockNumber }));
                        if (!headHash) {
                            return [2 /*return*/];
                        }
                        if ((_a = this._headHeaderHash) === null || _a === void 0 ? void 0 : _a.equals(blockHash)) {
                            this._headHeaderHash = headHash;
                        }
                        if ((_b = this._headBlockHash) === null || _b === void 0 ? void 0 : _b.equals(blockHash)) {
                            this._headBlockHash = headHash;
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this._getCanonicalHeader(blockNumber.addn(1))];
                    case 2:
                        childHeader = _c.sent();
                        return [4 /*yield*/, this._delChild(childHeader.hash(), childHeader.number, headHash, ops)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _c.sent();
                        if (error_7.type !== 'NotFoundError') {
                            throw error_7;
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Iterates through blocks starting at the specified iterator head and calls
     * the onBlock function on each block. The current location of an iterator
     * head can be retrieved using {@link Blockchain.getIteratorHead}.
     *
     * @param name - Name of the state root head
     * @param onBlock - Function called on each block with params (block, reorg)
     * @param maxBlocks - How many blocks to run. By default, run all unprocessed blocks in the canonical chain.
     * @returns number of blocks actually iterated
     */
    Blockchain.prototype.iterator = function (name, onBlock, maxBlocks) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._iterator(name, onBlock, maxBlocks)];
            });
        });
    };
    /**
     * @hidden
     */
    Blockchain.prototype._iterator = function (name, onBlock, maxBlocks) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            var headHash, lastBlock, headBlockNumber, nextBlockNumber, blocksRanCounter, nextBlock, reorg, error_8;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        headHash = this._heads[name] || this._genesis;
                                        if (!headHash) {
                                            return [2 /*return*/, 0];
                                        }
                                        if (maxBlocks && maxBlocks < 0) {
                                            throw 'If maxBlocks is provided, it has to be a non-negative number';
                                        }
                                        return [4 /*yield*/, this.dbManager.hashToNumber(headHash)];
                                    case 1:
                                        headBlockNumber = _a.sent();
                                        nextBlockNumber = headBlockNumber.addn(1);
                                        blocksRanCounter = 0;
                                        _a.label = 2;
                                    case 2:
                                        if (!(maxBlocks !== blocksRanCounter)) return [3 /*break*/, 8];
                                        _a.label = 3;
                                    case 3:
                                        _a.trys.push([3, 6, , 7]);
                                        return [4 /*yield*/, this._getBlock(nextBlockNumber)];
                                    case 4:
                                        nextBlock = _a.sent();
                                        this._heads[name] = nextBlock.hash();
                                        reorg = lastBlock ? lastBlock.hash().equals(nextBlock.header.parentHash) : false;
                                        lastBlock = nextBlock;
                                        return [4 /*yield*/, onBlock(nextBlock, reorg)];
                                    case 5:
                                        _a.sent();
                                        nextBlockNumber.iaddn(1);
                                        blocksRanCounter++;
                                        return [3 /*break*/, 7];
                                    case 6:
                                        error_8 = _a.sent();
                                        if (error_8.type === 'NotFoundError') {
                                            return [3 /*break*/, 8];
                                        }
                                        else {
                                            throw error_8;
                                        }
                                        return [3 /*break*/, 7];
                                    case 7: return [3 /*break*/, 2];
                                    case 8: return [4 /*yield*/, this._saveHeads()];
                                    case 9:
                                        _a.sent();
                                        return [2 /*return*/, blocksRanCounter];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Set header hash of a certain `tag`.
     * When calling the iterator, the iterator will start running the first child block after the header hash currenntly stored.
     * @param tag - The tag to save the headHash to
     * @param headHash - The head hash to save
     */
    Blockchain.prototype.setIteratorHead = function (tag, headHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setHead(tag, headHash)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Set header hash of a certain `tag`.
     * When calling the iterator, the iterator will start running the first child block after the header hash currenntly stored.
     * @param tag - The tag to save the headHash to
     * @param headHash - The head hash to save
     *
     * @deprecated use {@link Blockchain.setIteratorHead()} instead
     */
    Blockchain.prototype.setHead = function (tag, headHash) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initAndLock(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this._heads[tag] = headHash;
                                        return [4 /*yield*/, this._saveHeads()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Methods regarding re-org operations */
    /**
     * Find the common ancestor of the new block and the old block.
     * @param newHeader - the new block header
     */
    Blockchain.prototype._findAncient = function (newHeader) {
        return __awaiter(this, void 0, void 0, function () {
            var header;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._headHeaderHash) {
                            throw new Error('No head header set');
                        }
                        return [4 /*yield*/, this._getBlock(this._headHeaderHash)];
                    case 1:
                        header = (_a.sent()).header;
                        if (!header.number.gt(newHeader.number)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getCanonicalHeader(newHeader.number)];
                    case 2:
                        header = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(!header.number.eq(newHeader.number) && newHeader.number.gtn(0))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._getHeader(newHeader.parentHash, newHeader.number.subn(1))];
                    case 4:
                        newHeader = _a.sent();
                        return [3 /*break*/, 3];
                    case 5:
                        if (!header.number.eq(newHeader.number)) {
                            throw new Error('Failed to find ancient header');
                        }
                        _a.label = 6;
                    case 6:
                        if (!(!header.hash().equals(newHeader.hash()) && header.number.gtn(0))) return [3 /*break*/, 9];
                        return [4 /*yield*/, this._getCanonicalHeader(header.number.subn(1))];
                    case 7:
                        header = _a.sent();
                        return [4 /*yield*/, this._getHeader(newHeader.parentHash, newHeader.number.subn(1))];
                    case 8:
                        newHeader = _a.sent();
                        return [3 /*break*/, 6];
                    case 9:
                        if (!header.hash().equals(newHeader.hash())) {
                            throw new Error('Failed to find ancient header');
                        }
                        return [2 /*return*/, header];
                }
            });
        });
    };
    /**
     * Build clique snapshots.
     * @param header - the new block header
     */
    Blockchain.prototype._cliqueBuildSnapshots = function (header) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!header.cliqueIsEpochTransition()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.cliqueUpdateVotes(header)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.cliqueUpdateLatestBlockSigners(header)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove clique snapshots with blockNumber higher than input.
     * @param blockNumber - the block number from which we start deleting
     */
    Blockchain.prototype._cliqueDeleteSnapshots = function (blockNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // remove blockNumber from clique snapshots
                        // (latest signer states, latest votes, latest block signers)
                        this._cliqueLatestSignerStates = this._cliqueLatestSignerStates.filter(function (s) {
                            return s[0].lte(blockNumber);
                        });
                        return [4 /*yield*/, this.cliqueUpdateSignerStates()];
                    case 1:
                        _a.sent();
                        this._cliqueLatestVotes = this._cliqueLatestVotes.filter(function (v) { return v[0].lte(blockNumber); });
                        return [4 /*yield*/, this.cliqueUpdateVotes()];
                    case 2:
                        _a.sent();
                        this._cliqueLatestBlockSigners = this._cliqueLatestBlockSigners.filter(function (s) {
                            return s[0].lte(blockNumber);
                        });
                        return [4 /*yield*/, this.cliqueUpdateLatestBlockSigners()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pushes DB operations to delete canonical number assignments for specified
     * block number and above This only deletes `NumberToHash` references, and not
     * the blocks themselves. Note: this does not write to the DB but only pushes
     * to a DB operations list.
     * @param blockNumber - the block number from which we start deleting
     * canonical chain assignments (including this block)
     * @param headHash - the hash of the current canonical chain head. The _heads
     * reference matching any hash of any of the deleted blocks will be set to
     * this
     * @param ops - the DatabaseOperation list to write DatabaseOperations to
     * @hidden
     */
    Blockchain.prototype._deleteCanonicalChainReferences = function (blockNumber, headHash, ops) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        blockNumber = blockNumber.clone();
                        return [4 /*yield*/, this.safeNumberToHash(blockNumber)];
                    case 1:
                        hash = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!hash) return [3 /*break*/, 4];
                        ops.push(helpers_1.DBOp.del(operation_1.DBTarget.NumberToHash, { blockNumber: blockNumber }));
                        // reset stale iterator heads to current canonical head this can, for
                        // instance, make the VM run "older" (i.e. lower number blocks than last
                        // executed block) blocks to verify the chain up to the current, actual,
                        // head.
                        Object.keys(this._heads).forEach(function (name) {
                            if (_this._heads[name].equals(hash)) {
                                // explicitly cast as Buffer: it is not possible that `hash` is false
                                // here, but TypeScript does not understand this.
                                _this._heads[name] = headHash;
                            }
                        });
                        // reset stale headBlock to current canonical
                        if ((_a = this._headBlockHash) === null || _a === void 0 ? void 0 : _a.equals(hash)) {
                            this._headBlockHash = headHash;
                        }
                        blockNumber.iaddn(1);
                        return [4 /*yield*/, this.safeNumberToHash(blockNumber)];
                    case 3:
                        hash = _b.sent();
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Given a `header`, put all operations to change the canonical chain directly
     * into `ops`. This walks the supplied `header` backwards. It is thus assumed
     * that this header should be canonical header. For each header the
     * corresponding hash corresponding to the current canonical chain in the DB
     * is checked If the number => hash reference does not correspond to the
     * reference in the DB, we overwrite this reference with the implied number =>
     * hash reference Also, each `_heads` member is checked; if these point to a
     * stale hash, then the hash which we terminate the loop (i.e. the first hash
     * which matches the number => hash of the implied chain) is put as this stale
     * head hash The same happens to _headBlockHash
     * @param header - The canonical header.
     * @param ops - The database operations list.
     * @hidden
     */
    Blockchain.prototype._rebuildCanonical = function (header, ops) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var currentNumber, currentCanonicalHash, staleHash, staleHeads, staleHeadBlock, loopCondition, blockHash, blockNumber, error_9;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currentNumber = header.number.clone() // we change this during this method with `isubn`
                        ;
                        currentCanonicalHash = header.hash();
                        staleHash = false;
                        staleHeads = [];
                        staleHeadBlock = false;
                        loopCondition = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.safeNumberToHash(currentNumber)];
                                    case 1:
                                        staleHash = _a.sent();
                                        currentCanonicalHash = header.hash();
                                        return [2 /*return*/, !staleHash || !currentCanonicalHash.equals(staleHash)];
                                }
                            });
                        }); };
                        _b.label = 1;
                    case 1: return [4 /*yield*/, loopCondition()];
                    case 2:
                        if (!_b.sent()) return [3 /*break*/, 7];
                        blockHash = header.hash();
                        blockNumber = header.number;
                        if (blockNumber.isZero()) {
                            return [3 /*break*/, 7];
                        }
                        (0, helpers_1.DBSaveLookups)(blockHash, blockNumber).map(function (op) {
                            ops.push(op);
                        });
                        // mark each key `_heads` which is currently set to the hash in the DB as
                        // stale to overwrite this later.
                        Object.keys(this._heads).forEach(function (name) {
                            if (staleHash && _this._heads[name].equals(staleHash)) {
                                staleHeads.push(name);
                            }
                        });
                        // flag stale headBlock for reset
                        if (staleHash && ((_a = this._headBlockHash) === null || _a === void 0 ? void 0 : _a.equals(staleHash))) {
                            staleHeadBlock = true;
                        }
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._getHeader(header.parentHash, currentNumber.isubn(1))];
                    case 4:
                        header = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_9 = _b.sent();
                        staleHeads = [];
                        if (error_9.type !== 'NotFoundError') {
                            throw error_9;
                        }
                        return [3 /*break*/, 7];
                    case 6: return [3 /*break*/, 1];
                    case 7:
                        // the stale hash is equal to the blockHash set stale heads to last
                        // previously valid canonical block
                        staleHeads.forEach(function (name) {
                            _this._heads[name] = currentCanonicalHash;
                        });
                        // set stale headBlock to last previously valid canonical block
                        if (staleHeadBlock) {
                            this._headBlockHash = currentCanonicalHash;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Helper functions */
    /**
     * Builds the `DatabaseOperation[]` list which describes the DB operations to
     * write the heads, head header hash and the head header block to the DB
     * @hidden
     */
    Blockchain.prototype._saveHeadOps = function () {
        return [
            helpers_1.DBOp.set(operation_1.DBTarget.Heads, this._heads),
            helpers_1.DBOp.set(operation_1.DBTarget.HeadHeader, this._headHeaderHash),
            helpers_1.DBOp.set(operation_1.DBTarget.HeadBlock, this._headBlockHash),
        ];
    };
    /**
     * Gets the `DatabaseOperation[]` list to save `_heads`, `_headHeaderHash` and
     * `_headBlockHash` and writes these to the DB
     * @hidden
     */
    Blockchain.prototype._saveHeads = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.dbManager.batch(this._saveHeadOps())];
            });
        });
    };
    /**
     * Gets a header by hash and number. Header can exist outside the canonical
     * chain
     *
     * @hidden
     */
    Blockchain.prototype._getHeader = function (hash, number) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!number) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dbManager.hashToNumber(hash)];
                    case 1:
                        number = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.dbManager.getHeader(hash, number)];
                }
            });
        });
    };
    /**
     * Gets a header by number. Header must be in the canonical chain
     *
     * @hidden
     */
    Blockchain.prototype._getCanonicalHeader = function (number) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbManager.numberToHash(number)];
                    case 1:
                        hash = _a.sent();
                        return [2 /*return*/, this._getHeader(hash, number)];
                }
            });
        });
    };
    /**
     * This method either returns a Buffer if there exists one in the DB or if it
     * does not exist (DB throws a `NotFoundError`) then return false If DB throws
     * any other error, this function throws.
     * @param number
     */
    Blockchain.prototype.safeNumberToHash = function (number) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.dbManager.numberToHash(number)];
                    case 1:
                        hash = _a.sent();
                        return [2 /*return*/, hash];
                    case 2:
                        error_10 = _a.sent();
                        if (error_10.type !== 'NotFoundError') {
                            throw error_10;
                        }
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Helper to determine if a signer is in or out of turn for the next block.
     * @param signer The signer address
     */
    Blockchain.prototype.cliqueSignerInTurn = function (signer) {
        return __awaiter(this, void 0, void 0, function () {
            var signers, signerIndex, number;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signers = this.cliqueActiveSigners();
                        signerIndex = signers.findIndex(function (address) { return address.equals(signer); });
                        if (signerIndex === -1) {
                            throw new Error('Signer not found');
                        }
                        return [4 /*yield*/, this.getLatestHeader()];
                    case 1:
                        number = (_a.sent()).number;
                        return [2 /*return*/, number.addn(1).mod(new ethereumjs_util_1.BN(signers.length)).eqn(signerIndex)];
                }
            });
        });
    };
    return Blockchain;
}());
exports.default = Blockchain;
//# sourceMappingURL=index.js.map
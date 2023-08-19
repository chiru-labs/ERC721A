"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockBuilder = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
var merkle_patricia_tree_1 = require("merkle-patricia-tree");
var block_1 = require("@ethereumjs/block");
var common_1 = require("@ethereumjs/common");
var bloom_1 = __importDefault(require("./bloom"));
var runBlock_1 = require("./runBlock");
var BlockBuilder = /** @class */ (function () {
    function BlockBuilder(vm, opts) {
        var _a, _b, _c, _d, _e, _f;
        /**
         * The cumulative gas used by the transactions added to the block.
         */
        this.gasUsed = new ethereumjs_util_1.BN(0);
        this.transactions = [];
        this.transactionResults = [];
        this.checkpointed = false;
        this.reverted = false;
        this.built = false;
        this.vm = vm;
        this.blockOpts = __assign(__assign({ putBlockIntoBlockchain: true }, opts.blockOpts), { common: this.vm._common });
        this.headerData = __assign(__assign({}, opts.headerData), { parentHash: (_b = (_a = opts.headerData) === null || _a === void 0 ? void 0 : _a.parentHash) !== null && _b !== void 0 ? _b : opts.parentBlock.hash(), number: (_d = (_c = opts.headerData) === null || _c === void 0 ? void 0 : _c.number) !== null && _d !== void 0 ? _d : opts.parentBlock.header.number.addn(1), gasLimit: (_f = (_e = opts.headerData) === null || _e === void 0 ? void 0 : _e.gasLimit) !== null && _f !== void 0 ? _f : opts.parentBlock.header.gasLimit });
        if (this.vm._common.isActivatedEIP(1559) && this.headerData.baseFeePerGas === undefined) {
            this.headerData.baseFeePerGas = opts.parentBlock.header.calcNextBaseFee();
        }
    }
    /**
     * Throws if the block has already been built or reverted.
     */
    BlockBuilder.prototype.checkStatus = function () {
        if (this.built) {
            throw new Error('Block has already been built');
        }
        if (this.reverted) {
            throw new Error('State has already been reverted');
        }
    };
    /**
     * Calculates and returns the transactionsTrie for the block.
     */
    BlockBuilder.prototype.transactionsTrie = function () {
        return __awaiter(this, void 0, void 0, function () {
            var trie, _a, _b, _c, i, tx, e_1_1;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        trie = new merkle_patricia_tree_1.BaseTrie();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, 7, 8]);
                        _a = __values(this.transactions.entries()), _b = _a.next();
                        _e.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        _c = __read(_b.value, 2), i = _c[0], tx = _c[1];
                        return [4 /*yield*/, trie.put(ethereumjs_util_1.rlp.encode(i), tx.serialize())];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, trie.root];
                }
            });
        });
    };
    /**
     * Calculates and returns the logs bloom for the block.
     */
    BlockBuilder.prototype.logsBloom = function () {
        var e_2, _a;
        var bloom = new bloom_1.default();
        try {
            for (var _b = __values(this.transactionResults), _c = _b.next(); !_c.done; _c = _b.next()) {
                var txResult = _c.value;
                // Combine blooms via bitwise OR
                bloom.or(txResult.bloom);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return bloom.bitvector;
    };
    /**
     * Calculates and returns the receiptTrie for the block.
     */
    BlockBuilder.prototype.receiptTrie = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gasUsed, receiptTrie, _a, _b, _c, i, txResult, tx, encodedReceipt, e_3_1;
            var e_3, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        gasUsed = new ethereumjs_util_1.BN(0);
                        receiptTrie = new merkle_patricia_tree_1.BaseTrie();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, 7, 8]);
                        _a = __values(this.transactionResults.entries()), _b = _a.next();
                        _e.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        _c = __read(_b.value, 2), i = _c[0], txResult = _c[1];
                        tx = this.transactions[i];
                        gasUsed.iadd(txResult.gasUsed);
                        encodedReceipt = (0, runBlock_1.encodeReceipt)(tx, txResult.receipt);
                        return [4 /*yield*/, receiptTrie.put(ethereumjs_util_1.rlp.encode(i), encodedReceipt)];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_3_1 = _e.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, receiptTrie.root];
                }
            });
        });
    };
    /**
     * Adds the block miner reward to the coinbase account.
     */
    BlockBuilder.prototype.rewardMiner = function () {
        return __awaiter(this, void 0, void 0, function () {
            var minerReward, reward, coinbase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        minerReward = new ethereumjs_util_1.BN(this.vm._common.param('pow', 'minerReward'));
                        reward = (0, runBlock_1.calculateMinerReward)(minerReward, 0);
                        coinbase = this.headerData.coinbase
                            ? new ethereumjs_util_1.Address((0, ethereumjs_util_1.toBuffer)(this.headerData.coinbase))
                            : ethereumjs_util_1.Address.zero();
                        return [4 /*yield*/, (0, runBlock_1.rewardAccount)(this.vm.stateManager, coinbase, reward)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Run and add a transaction to the block being built.
     * Please note that this modifies the state of the VM.
     * Throws if the transaction's gasLimit is greater than
     * the remaining gas in the block.
     */
    BlockBuilder.prototype.addTransaction = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var blockGasLimit, blockGasRemaining, header, blockData, block, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkStatus();
                        if (!!this.checkpointed) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.vm.stateManager.checkpoint()];
                    case 1:
                        _a.sent();
                        this.checkpointed = true;
                        _a.label = 2;
                    case 2:
                        blockGasLimit = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(this.headerData.gasLimit));
                        blockGasRemaining = blockGasLimit.sub(this.gasUsed);
                        if (tx.gasLimit.gt(blockGasRemaining)) {
                            throw new Error('tx has a higher gas limit than the remaining gas in the block');
                        }
                        header = __assign(__assign({}, this.headerData), { gasUsed: this.gasUsed });
                        blockData = { header: header, transactions: this.transactions };
                        block = block_1.Block.fromBlockData(blockData, this.blockOpts);
                        return [4 /*yield*/, this.vm.runTx({ tx: tx, block: block })];
                    case 3:
                        result = _a.sent();
                        this.transactions.push(tx);
                        this.transactionResults.push(result);
                        this.gasUsed.iadd(result.gasUsed);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Reverts the checkpoint on the StateManager to reset the state from any transactions that have been run.
     */
    BlockBuilder.prototype.revert = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkStatus();
                        if (!this.checkpointed) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.vm.stateManager.revert()];
                    case 1:
                        _a.sent();
                        this.reverted = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This method returns the finalized block.
     * It also:
     *  - Assigns the reward for miner (PoW)
     *  - Commits the checkpoint on the StateManager
     *  - Sets the tip of the VM's blockchain to this block
     * For PoW, optionally seals the block with params `nonce` and `mixHash`,
     * which is validated along with the block number and difficulty by ethash.
     * For PoA, please pass `blockOption.cliqueSigner` into the buildBlock constructor,
     * as the signer will be awarded the txs amount spent on gas as they are added.
     */
    BlockBuilder.prototype.build = function (sealOpts) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var blockOpts, consensusType, stateRoot, transactionsTrie, receiptTrie, logsBloom, gasUsed, timestamp, headerData, blockData, block;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.checkStatus();
                        blockOpts = this.blockOpts;
                        consensusType = this.vm._common.consensusType();
                        if (!(consensusType === common_1.ConsensusType.ProofOfWork)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rewardMiner()];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2: return [4 /*yield*/, this.vm.stateManager.getStateRoot(true)];
                    case 3:
                        stateRoot = _d.sent();
                        return [4 /*yield*/, this.transactionsTrie()];
                    case 4:
                        transactionsTrie = _d.sent();
                        return [4 /*yield*/, this.receiptTrie()];
                    case 5:
                        receiptTrie = _d.sent();
                        logsBloom = this.logsBloom();
                        gasUsed = this.gasUsed;
                        timestamp = (_a = this.headerData.timestamp) !== null && _a !== void 0 ? _a : Math.round(Date.now() / 1000);
                        headerData = __assign(__assign({}, this.headerData), { stateRoot: stateRoot, transactionsTrie: transactionsTrie, receiptTrie: receiptTrie, logsBloom: logsBloom, gasUsed: gasUsed, timestamp: timestamp });
                        if (consensusType === common_1.ConsensusType.ProofOfWork) {
                            headerData.nonce = (_b = sealOpts === null || sealOpts === void 0 ? void 0 : sealOpts.nonce) !== null && _b !== void 0 ? _b : headerData.nonce;
                            headerData.mixHash = (_c = sealOpts === null || sealOpts === void 0 ? void 0 : sealOpts.mixHash) !== null && _c !== void 0 ? _c : headerData.mixHash;
                        }
                        blockData = { header: headerData, transactions: this.transactions };
                        block = block_1.Block.fromBlockData(blockData, blockOpts);
                        if (!this.blockOpts.putBlockIntoBlockchain) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.vm.blockchain.putBlock(block)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        this.built = true;
                        if (!this.checkpointed) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.vm.stateManager.commit()];
                    case 8:
                        _d.sent();
                        this.checkpointed = false;
                        _d.label = 9;
                    case 9: return [2 /*return*/, block];
                }
            });
        });
    };
    return BlockBuilder;
}());
exports.BlockBuilder = BlockBuilder;
function buildBlock(opts) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new BlockBuilder(this, opts)];
        });
    });
}
exports.default = buildBlock;
//# sourceMappingURL=buildBlock.js.map
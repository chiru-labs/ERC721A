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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTxReceipt = exports.encodeReceipt = exports.rewardAccount = exports.calculateMinerReward = void 0;
var debug_1 = require("debug");
var merkle_patricia_tree_1 = require("merkle-patricia-tree");
var ethereumjs_util_1 = require("ethereumjs-util");
var block_1 = require("@ethereumjs/block");
var common_1 = require("@ethereumjs/common");
var bloom_1 = __importDefault(require("./bloom"));
var opcodes_1 = require("./evm/opcodes");
var tx_1 = require("@ethereumjs/tx");
var DAOConfig = __importStar(require("./config/dao_fork_accounts_config.json"));
var debug = (0, debug_1.debug)('vm:block');
/* DAO account list */
var DAOAccountList = DAOConfig.DAOAccounts;
var DAORefundContract = DAOConfig.DAORefundContract;
/**
 * @ignore
 */
function runBlock(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var state, root, block, generateFields, result, err_1, stateRoot, bloom, gasUsed, receiptTrie, transactionsTrie, generatedFields, blockData, msg, msg, msg, msg, results, afterBlockEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = this.stateManager;
                    root = opts.root;
                    block = opts.block;
                    generateFields = !!opts.generate;
                    /**
                     * The `beforeBlock` event.
                     *
                     * @event Event: beforeBlock
                     * @type {Object}
                     * @property {Block} block emits the block that is about to be processed
                     */
                    return [4 /*yield*/, this._emit('beforeBlock', block)];
                case 1:
                    /**
                     * The `beforeBlock` event.
                     *
                     * @event Event: beforeBlock
                     * @type {Object}
                     * @property {Block} block emits the block that is about to be processed
                     */
                    _a.sent();
                    if (this._hardforkByBlockNumber || this._hardforkByTD) {
                        this._common.setHardforkByBlockNumber(block.header.number.toNumber(), this._hardforkByTD);
                    }
                    if (this.DEBUG) {
                        debug('-'.repeat(100));
                        debug("Running block hash=" + block.hash().toString('hex') + " number=" + block.header.number + " hardfork=" + this._common.hardfork());
                    }
                    if (!root) return [3 /*break*/, 3];
                    if (this.DEBUG) {
                        debug("Set provided state root " + root.toString('hex'));
                    }
                    return [4 /*yield*/, state.setStateRoot(root)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!(this._common.hardforkIsActiveOnChain('dao') &&
                        block.header.number.eq(this._common.hardforkBlockBN('dao')))) return [3 /*break*/, 5];
                    if (this.DEBUG) {
                        debug("Apply DAO hardfork");
                    }
                    return [4 /*yield*/, _applyDAOHardfork(state)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: 
                // Checkpoint state
                return [4 /*yield*/, state.checkpoint()];
                case 6:
                    // Checkpoint state
                    _a.sent();
                    if (this.DEBUG) {
                        debug("block checkpoint");
                    }
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 11]);
                    return [4 /*yield*/, applyBlock.bind(this)(block, opts)];
                case 8:
                    result = _a.sent();
                    if (this.DEBUG) {
                        debug("Received block results gasUsed=" + result.gasUsed + " bloom=" + (0, opcodes_1.short)(result.bloom.bitvector) + " (" + result.bloom.bitvector.length + " bytes) receiptRoot=" + result.receiptRoot.toString('hex') + " receipts=" + result.receipts.length + " txResults=" + result.results.length);
                    }
                    return [3 /*break*/, 11];
                case 9:
                    err_1 = _a.sent();
                    return [4 /*yield*/, state.revert()];
                case 10:
                    _a.sent();
                    if (this.DEBUG) {
                        debug("block checkpoint reverted");
                    }
                    throw err_1;
                case 11: 
                // Persist state
                return [4 /*yield*/, state.commit()];
                case 12:
                    // Persist state
                    _a.sent();
                    if (this.DEBUG) {
                        debug("block checkpoint committed");
                    }
                    return [4 /*yield*/, state.getStateRoot(false)
                        // Given the generate option, either set resulting header
                        // values to the current block, or validate the resulting
                        // header values against the current block.
                    ];
                case 13:
                    stateRoot = _a.sent();
                    if (!generateFields) return [3 /*break*/, 15];
                    bloom = result.bloom.bitvector;
                    gasUsed = result.gasUsed;
                    receiptTrie = result.receiptRoot;
                    return [4 /*yield*/, _genTxTrie(block)];
                case 14:
                    transactionsTrie = _a.sent();
                    generatedFields = { stateRoot: stateRoot, bloom: bloom, gasUsed: gasUsed, receiptTrie: receiptTrie, transactionsTrie: transactionsTrie };
                    blockData = __assign(__assign({}, block), { header: __assign(__assign({}, block.header), generatedFields) });
                    block = block_1.Block.fromBlockData(blockData, { common: this._common });
                    return [3 /*break*/, 16];
                case 15:
                    if (result.receiptRoot && !result.receiptRoot.equals(block.header.receiptTrie)) {
                        if (this.DEBUG) {
                            debug("Invalid receiptTrie received=" + result.receiptRoot.toString('hex') + " expected=" + block.header.receiptTrie.toString('hex'));
                        }
                        msg = _errorMsg('invalid receiptTrie', this, block);
                        throw new Error(msg);
                    }
                    if (!result.bloom.bitvector.equals(block.header.logsBloom)) {
                        if (this.DEBUG) {
                            debug("Invalid bloom received=" + result.bloom.bitvector.toString('hex') + " expected=" + block.header.logsBloom.toString('hex'));
                        }
                        msg = _errorMsg('invalid bloom', this, block);
                        throw new Error(msg);
                    }
                    if (!result.gasUsed.eq(block.header.gasUsed)) {
                        if (this.DEBUG) {
                            debug("Invalid gasUsed received=" + result.gasUsed + " expected=" + block.header.gasUsed);
                        }
                        msg = _errorMsg('invalid gasUsed', this, block);
                        throw new Error(msg);
                    }
                    if (!stateRoot.equals(block.header.stateRoot)) {
                        if (this.DEBUG) {
                            debug("Invalid stateRoot received=" + stateRoot.toString('hex') + " expected=" + block.header.stateRoot.toString('hex'));
                        }
                        msg = _errorMsg('invalid block stateRoot', this, block);
                        throw new Error(msg);
                    }
                    _a.label = 16;
                case 16:
                    results = {
                        receipts: result.receipts,
                        results: result.results,
                        stateRoot: stateRoot,
                        gasUsed: result.gasUsed,
                        logsBloom: result.bloom.bitvector,
                        receiptRoot: result.receiptRoot,
                    };
                    afterBlockEvent = __assign(__assign({}, results), { block: block });
                    /**
                     * The `afterBlock` event
                     *
                     * @event Event: afterBlock
                     * @type {AfterBlockEvent}
                     * @property {AfterBlockEvent} result emits the results of processing a block
                     */
                    return [4 /*yield*/, this._emit('afterBlock', afterBlockEvent)];
                case 17:
                    /**
                     * The `afterBlock` event
                     *
                     * @event Event: afterBlock
                     * @type {AfterBlockEvent}
                     * @property {AfterBlockEvent} result emits the results of processing a block
                     */
                    _a.sent();
                    if (this.DEBUG) {
                        debug("Running block finished hash=" + block.hash().toString('hex') + " number=" + block.header.number + " hardfork=" + this._common.hardfork());
                    }
                    return [2 /*return*/, results];
            }
        });
    });
}
exports.default = runBlock;
/**
 * Validates and applies a block, computing the results of
 * applying its transactions. This method doesn't modify the
 * block itself. It computes the block rewards and puts
 * them on state (but doesn't persist the changes).
 * @param {Block} block
 * @param {RunBlockOpts} opts
 */
function applyBlock(block, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var msg, blockResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!opts.skipBlockValidation) return [3 /*break*/, 3];
                    if (!block.header.gasLimit.gte(new ethereumjs_util_1.BN('8000000000000000', 16))) return [3 /*break*/, 1];
                    msg = _errorMsg('Invalid block with gas limit greater than (2^63 - 1)', this, block);
                    throw new Error(msg);
                case 1:
                    if (this.DEBUG) {
                        debug("Validate block");
                    }
                    return [4 /*yield*/, block.validate(this.blockchain)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    // Apply transactions
                    if (this.DEBUG) {
                        debug("Apply transactions");
                    }
                    return [4 /*yield*/, applyTransactions.bind(this)(block, opts)
                        // Pay ommers and miners
                    ];
                case 4:
                    blockResults = _a.sent();
                    if (!(block._common.consensusType() === common_1.ConsensusType.ProofOfWork)) return [3 /*break*/, 6];
                    return [4 /*yield*/, assignBlockRewards.bind(this)(block)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, blockResults];
            }
        });
    });
}
/**
 * Applies the transactions in a block, computing the receipts
 * as well as gas usage and some relevant data. This method is
 * side-effect free (it doesn't modify the block nor the state).
 * @param {Block} block
 * @param {RunBlockOpts} opts
 */
function applyTransactions(block, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var bloom, gasUsed, receiptTrie, receipts, txResults, txIdx, tx, maxGasLimit, gasLimitIsHigherThanBlock, msg, skipBalance, skipNonce, txRes, encodedReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bloom = new bloom_1.default();
                    gasUsed = new ethereumjs_util_1.BN(0);
                    receiptTrie = new merkle_patricia_tree_1.BaseTrie();
                    receipts = [];
                    txResults = [];
                    txIdx = 0;
                    _a.label = 1;
                case 1:
                    if (!(txIdx < block.transactions.length)) return [3 /*break*/, 5];
                    tx = block.transactions[txIdx];
                    maxGasLimit = void 0;
                    if (this._common.isActivatedEIP(1559)) {
                        maxGasLimit = block.header.gasLimit.muln(this._common.param('gasConfig', 'elasticityMultiplier'));
                    }
                    else {
                        maxGasLimit = block.header.gasLimit;
                    }
                    gasLimitIsHigherThanBlock = maxGasLimit.lt(tx.gasLimit.add(gasUsed));
                    if (gasLimitIsHigherThanBlock) {
                        msg = _errorMsg('tx has a higher gas limit than the block', this, block);
                        throw new Error(msg);
                    }
                    skipBalance = opts.skipBalance, skipNonce = opts.skipNonce;
                    return [4 /*yield*/, this.runTx({
                            tx: tx,
                            block: block,
                            skipBalance: skipBalance,
                            skipNonce: skipNonce,
                            blockGasUsed: gasUsed,
                        })];
                case 2:
                    txRes = _a.sent();
                    txResults.push(txRes);
                    if (this.DEBUG) {
                        debug('-'.repeat(100));
                    }
                    // Add to total block gas usage
                    gasUsed = gasUsed.add(txRes.gasUsed);
                    if (this.DEBUG) {
                        debug("Add tx gas used (" + txRes.gasUsed + ") to total block gas usage (-> " + gasUsed + ")");
                    }
                    // Combine blooms via bitwise OR
                    bloom.or(txRes.bloom);
                    // Add receipt to trie to later calculate receipt root
                    receipts.push(txRes.receipt);
                    encodedReceipt = encodeReceipt(tx, txRes.receipt);
                    return [4 /*yield*/, receiptTrie.put(ethereumjs_util_1.rlp.encode(txIdx), encodedReceipt)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    txIdx++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, {
                        bloom: bloom,
                        gasUsed: gasUsed,
                        receiptRoot: receiptTrie.root,
                        receipts: receipts,
                        results: txResults,
                    }];
            }
        });
    });
}
/**
 * Calculates block rewards for miner and ommers and puts
 * the updated balances of their accounts to state.
 */
function assignBlockRewards(block) {
    return __awaiter(this, void 0, void 0, function () {
        var state, minerReward, ommers, ommers_1, ommers_1_1, ommer, reward_1, account_1, e_1_1, reward, account;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (this.DEBUG) {
                        debug("Assign block rewards");
                    }
                    state = this.stateManager;
                    minerReward = new ethereumjs_util_1.BN(this._common.param('pow', 'minerReward'));
                    ommers = block.uncleHeaders;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    ommers_1 = __values(ommers), ommers_1_1 = ommers_1.next();
                    _b.label = 2;
                case 2:
                    if (!!ommers_1_1.done) return [3 /*break*/, 5];
                    ommer = ommers_1_1.value;
                    reward_1 = calculateOmmerReward(ommer.number, block.header.number, minerReward);
                    return [4 /*yield*/, rewardAccount(state, ommer.coinbase, reward_1)];
                case 3:
                    account_1 = _b.sent();
                    if (this.DEBUG) {
                        debug("Add uncle reward " + reward_1 + " to account " + ommer.coinbase + " (-> " + account_1.balance + ")");
                    }
                    _b.label = 4;
                case 4:
                    ommers_1_1 = ommers_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (ommers_1_1 && !ommers_1_1.done && (_a = ommers_1.return)) _a.call(ommers_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8:
                    reward = calculateMinerReward(minerReward, ommers.length);
                    return [4 /*yield*/, rewardAccount(state, block.header.coinbase, reward)];
                case 9:
                    account = _b.sent();
                    if (this.DEBUG) {
                        debug("Add miner reward " + reward + " to account " + block.header.coinbase + " (-> " + account.balance + ")");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function calculateOmmerReward(ommerBlockNumber, blockNumber, minerReward) {
    var heightDiff = blockNumber.sub(ommerBlockNumber);
    var reward = new ethereumjs_util_1.BN(8).sub(heightDiff).mul(minerReward.divn(8));
    if (reward.ltn(0)) {
        reward = new ethereumjs_util_1.BN(0);
    }
    return reward;
}
function calculateMinerReward(minerReward, ommersNum) {
    // calculate nibling reward
    var niblingReward = minerReward.divn(32);
    var totalNiblingReward = niblingReward.muln(ommersNum);
    var reward = minerReward.add(totalNiblingReward);
    return reward;
}
exports.calculateMinerReward = calculateMinerReward;
function rewardAccount(state, address, reward) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, state.getAccount(address)];
                case 1:
                    account = _a.sent();
                    account.balance.iadd(reward);
                    return [4 /*yield*/, state.putAccount(address, account)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, account];
            }
        });
    });
}
exports.rewardAccount = rewardAccount;
/**
 * Returns the encoded tx receipt.
 */
function encodeReceipt(tx, receipt) {
    var encoded = ethereumjs_util_1.rlp.encode(Object.values(receipt));
    if (!tx.supports(tx_1.Capability.EIP2718TypedTransaction)) {
        return encoded;
    }
    var type = (0, ethereumjs_util_1.intToBuffer)(tx.type);
    return Buffer.concat([type, encoded]);
}
exports.encodeReceipt = encodeReceipt;
/**
 * Generates the tx receipt and returns { txReceipt, encodedReceipt, receiptLog }
 * @deprecated Please use the new `generateTxReceipt` located in runTx.
 */
function generateTxReceipt(tx, txRes, blockGasUsed) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var abstractTxReceipt, txReceipt, encodedReceipt, receiptLog, statusInfo, stateRoot;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    abstractTxReceipt = {
                        gasUsed: blockGasUsed.toArrayLike(Buffer),
                        bitvector: txRes.bloom.bitvector,
                        logs: (_a = txRes.execResult.logs) !== null && _a !== void 0 ? _a : [],
                    };
                    receiptLog = "Generate tx receipt transactionType=" + tx.type + " gasUsed=" + blockGasUsed + " bitvector=" + (0, opcodes_1.short)(abstractTxReceipt.bitvector) + " (" + abstractTxReceipt.bitvector.length + " bytes) logs=" + abstractTxReceipt.logs.length;
                    if (!!tx.supports(999)) return [3 /*break*/, 4];
                    if (!this._common.gteHardfork('byzantium')) return [3 /*break*/, 1];
                    // Post-Byzantium
                    txReceipt = __assign({ status: txRes.execResult.exceptionError ? 0 : 1 }, abstractTxReceipt);
                    statusInfo = txRes.execResult.exceptionError ? 'error' : 'ok';
                    receiptLog += " status=" + txReceipt.status + " (" + statusInfo + ") (>= Byzantium)";
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, this.stateManager.getStateRoot(true)];
                case 2:
                    stateRoot = _b.sent();
                    txReceipt = __assign({ stateRoot: stateRoot }, abstractTxReceipt);
                    receiptLog += " stateRoot=" + txReceipt.stateRoot.toString('hex') + " (< Byzantium)";
                    _b.label = 3;
                case 3:
                    encodedReceipt = ethereumjs_util_1.rlp.encode(Object.values(txReceipt));
                    return [3 /*break*/, 5];
                case 4:
                    // EIP2930 Transaction
                    txReceipt = __assign({ status: txRes.execResult.exceptionError ? 0 : 1 }, abstractTxReceipt);
                    encodedReceipt = Buffer.concat([(0, ethereumjs_util_1.intToBuffer)(tx.type), ethereumjs_util_1.rlp.encode(Object.values(txReceipt))]);
                    _b.label = 5;
                case 5: return [2 /*return*/, {
                        txReceipt: txReceipt,
                        encodedReceipt: encodedReceipt,
                        receiptLog: receiptLog,
                    }];
            }
        });
    });
}
exports.generateTxReceipt = generateTxReceipt;
// apply the DAO fork changes to the VM
function _applyDAOHardfork(state) {
    return __awaiter(this, void 0, void 0, function () {
        var DAORefundContractAddress, DAORefundAccount, DAOAccountList_1, DAOAccountList_1_1, addr, address, account, e_2_1;
        var e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    DAORefundContractAddress = new ethereumjs_util_1.Address(Buffer.from(DAORefundContract, 'hex'));
                    if (!!state.accountExists(DAORefundContractAddress)) return [3 /*break*/, 2];
                    return [4 /*yield*/, state.putAccount(DAORefundContractAddress, new ethereumjs_util_1.Account())];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [4 /*yield*/, state.getAccount(DAORefundContractAddress)];
                case 3:
                    DAORefundAccount = _b.sent();
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 10, 11, 12]);
                    DAOAccountList_1 = __values(DAOAccountList), DAOAccountList_1_1 = DAOAccountList_1.next();
                    _b.label = 5;
                case 5:
                    if (!!DAOAccountList_1_1.done) return [3 /*break*/, 9];
                    addr = DAOAccountList_1_1.value;
                    address = new ethereumjs_util_1.Address(Buffer.from(addr, 'hex'));
                    return [4 /*yield*/, state.getAccount(address)];
                case 6:
                    account = _b.sent();
                    DAORefundAccount.balance.iadd(account.balance);
                    // clear the accounts' balance
                    account.balance = new ethereumjs_util_1.BN(0);
                    return [4 /*yield*/, state.putAccount(address, account)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    DAOAccountList_1_1 = DAOAccountList_1.next();
                    return [3 /*break*/, 5];
                case 9: return [3 /*break*/, 12];
                case 10:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 11:
                    try {
                        if (DAOAccountList_1_1 && !DAOAccountList_1_1.done && (_a = DAOAccountList_1.return)) _a.call(DAOAccountList_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 12: 
                // finally, put the Refund Account
                return [4 /*yield*/, state.putAccount(DAORefundContractAddress, DAORefundAccount)];
                case 13:
                    // finally, put the Refund Account
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function _genTxTrie(block) {
    return __awaiter(this, void 0, void 0, function () {
        var trie, _a, _b, _c, i, tx, e_3_1;
        var e_3, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    trie = new merkle_patricia_tree_1.BaseTrie();
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 8]);
                    _a = __values(block.transactions.entries()), _b = _a.next();
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
                    e_3_1 = _e.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/, trie.root];
            }
        });
    });
}
/**
 * Internal helper function to create an annotated error message
 *
 * @param msg Base error message
 * @hidden
 */
function _errorMsg(msg, vm, block) {
    var blockErrorStr = 'errorStr' in block ? block.errorStr() : 'block';
    var errorMsg = msg + " (" + vm.errorStr() + " -> " + blockErrorStr + ")";
    return errorMsg;
}
//# sourceMappingURL=runBlock.js.map
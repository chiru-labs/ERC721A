"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ethereumjs_util_1 = require("ethereumjs-util");
var rlp_1 = require("rlp");
var bloom_1 = require("./bloom");
var promisify = require('util.promisify');
var Trie = require('merkle-patricia-tree');
/**
 * @ignore
 */
function runBlock(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var state, block, generateStateRoot, result, err_1, stateRoot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (opts === undefined) {
                        throw new Error('invalid input, opts must be provided');
                    }
                    if (!opts.block) {
                        throw new Error('invalid input, block must be provided');
                    }
                    state = this.pStateManager;
                    block = opts.block;
                    generateStateRoot = !!opts.generate;
                    /**
                     * The `beforeBlock` event.
                     *
                     * @event Event: beforeBlock
                     * @type {Object}
                     * @property {Block} block emits the block that is about to be processed
                     */
                    return [4 /*yield*/, this._emit('beforeBlock', opts.block)
                        // Set state root if provided
                    ];
                case 1:
                    /**
                     * The `beforeBlock` event.
                     *
                     * @event Event: beforeBlock
                     * @type {Object}
                     * @property {Block} block emits the block that is about to be processed
                     */
                    _a.sent();
                    if (!opts.root) return [3 /*break*/, 3];
                    return [4 /*yield*/, state.setStateRoot(opts.root)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: 
                // Checkpoint state
                return [4 /*yield*/, state.checkpoint()];
                case 4:
                    // Checkpoint state
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 9]);
                    return [4 /*yield*/, applyBlock.bind(this)(block, opts)];
                case 6:
                    result = _a.sent();
                    return [3 /*break*/, 9];
                case 7:
                    err_1 = _a.sent();
                    return [4 /*yield*/, state.revert()];
                case 8:
                    _a.sent();
                    throw err_1;
                case 9: 
                // Persist state
                return [4 /*yield*/, state.commit()];
                case 10:
                    // Persist state
                    _a.sent();
                    return [4 /*yield*/, state.getStateRoot()
                        // Given the generate option, either set resulting header
                        // values to the current block, or validate the resulting
                        // header values against the current block.
                    ];
                case 11:
                    stateRoot = _a.sent();
                    // Given the generate option, either set resulting header
                    // values to the current block, or validate the resulting
                    // header values against the current block.
                    if (generateStateRoot) {
                        block.header.stateRoot = stateRoot;
                        block.header.bloom = result.bloom.bitvector;
                    }
                    else {
                        if (result.receiptRoot &&
                            result.receiptRoot.toString('hex') !== block.header.receiptTrie.toString('hex')) {
                            throw new Error('invalid receiptTrie ');
                        }
                        if (result.bloom.bitvector.toString('hex') !== block.header.bloom.toString('hex')) {
                            throw new Error('invalid bloom ');
                        }
                        if (ethereumjs_util_1.bufferToInt(block.header.gasUsed) !== Number(result.gasUsed)) {
                            throw new Error('invalid gasUsed ');
                        }
                        if (stateRoot.toString('hex') !== block.header.stateRoot.toString('hex')) {
                            throw new Error('invalid block stateRoot ');
                        }
                    }
                    /**
                     * The `afterBlock` event
                     *
                     * @event Event: afterBlock
                     * @type {Object}
                     * @property {Object} result emits the results of processing a block
                     */
                    return [4 /*yield*/, this._emit('afterBlock', {
                            receipts: result.receipts,
                            results: result.results,
                        })];
                case 12:
                    /**
                     * The `afterBlock` event
                     *
                     * @event Event: afterBlock
                     * @type {Object}
                     * @property {Object} result emits the results of processing a block
                     */
                    _a.sent();
                    return [2 /*return*/, { receipts: result.receipts, results: result.results }];
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
 * @param {Boolean} [skipBlockValidation=false]
 */
function applyBlock(block, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var txResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!opts.skipBlockValidation) return [3 /*break*/, 3];
                    if (!new BN(block.header.gasLimit).gte(new BN('8000000000000000', 16))) return [3 /*break*/, 1];
                    throw new Error('Invalid block with gas limit greater than (2^63 - 1)');
                case 1: return [4 /*yield*/, promisify(block.validate).bind(block)(this.blockchain)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, applyTransactions.bind(this)(block, opts)
                    // Pay ommers and miners
                ];
                case 4:
                    txResults = _a.sent();
                    // Pay ommers and miners
                    return [4 /*yield*/, assignBlockRewards.bind(this)(block)];
                case 5:
                    // Pay ommers and miners
                    _a.sent();
                    return [2 /*return*/, txResults];
            }
        });
    });
}
/**
 * Applies the transactions in a block, computing the receipts
 * as well as gas usage and some relevant data. This method is
 * side-effect free (it doesn't modify the block nor the state).
 * @param {Block} block
 */
function applyTransactions(block, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var bloom, gasUsed, receiptTrie, receipts, txResults, txIdx, tx, gasLimitIsHigherThanBlock, txRes, txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bloom = new bloom_1.default();
                    gasUsed = new BN(0);
                    receiptTrie = new Trie();
                    receipts = [];
                    txResults = [];
                    txIdx = 0;
                    _a.label = 1;
                case 1:
                    if (!(txIdx < block.transactions.length)) return [3 /*break*/, 5];
                    tx = block.transactions[txIdx];
                    gasLimitIsHigherThanBlock = new BN(block.header.gasLimit).lt(new BN(tx.gasLimit).add(gasUsed));
                    if (gasLimitIsHigherThanBlock) {
                        throw new Error('tx has a higher gas limit than the block');
                    }
                    return [4 /*yield*/, this.runTx({
                            tx: tx,
                            block: block,
                            skipBalance: opts.skipBalance,
                            skipNonce: opts.skipNonce,
                        })];
                case 2:
                    txRes = _a.sent();
                    txResults.push(txRes);
                    // Add to total block gas usage
                    gasUsed = gasUsed.add(txRes.gasUsed);
                    // Combine blooms via bitwise OR
                    bloom.or(txRes.bloom);
                    txReceipt = {
                        status: txRes.execResult.exceptionError ? 0 : 1,
                        gasUsed: gasUsed.toArrayLike(Buffer),
                        bitvector: txRes.bloom.bitvector,
                        logs: txRes.execResult.logs || [],
                    };
                    receipts.push(txReceipt);
                    // Add receipt to trie to later calculate receipt root
                    return [4 /*yield*/, promisify(receiptTrie.put).bind(receiptTrie)(rlp_1.encode(txIdx), rlp_1.encode(Object.values(txReceipt)))];
                case 3:
                    // Add receipt to trie to later calculate receipt root
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
        var state, minerReward, ommers, _i, ommers_1, ommer, reward_1, reward;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = this.pStateManager;
                    minerReward = new BN(this._common.param('pow', 'minerReward'));
                    ommers = block.uncleHeaders;
                    _i = 0, ommers_1 = ommers;
                    _a.label = 1;
                case 1:
                    if (!(_i < ommers_1.length)) return [3 /*break*/, 4];
                    ommer = ommers_1[_i];
                    reward_1 = calculateOmmerReward(new BN(ommer.number), new BN(block.header.number), minerReward);
                    return [4 /*yield*/, rewardAccount(state, ommer.coinbase, reward_1)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    reward = calculateMinerReward(minerReward, ommers.length);
                    return [4 /*yield*/, rewardAccount(state, block.header.coinbase, reward)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function calculateOmmerReward(ommerBlockNumber, blockNumber, minerReward) {
    var heightDiff = blockNumber.sub(ommerBlockNumber);
    var reward = new BN(8).sub(heightDiff).mul(minerReward.divn(8));
    if (reward.ltn(0)) {
        reward = new BN(0);
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
function rewardAccount(state, address, reward) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, state.getAccount(address)];
                case 1:
                    account = _a.sent();
                    account.balance = ethereumjs_util_1.toBuffer(new BN(account.balance).add(reward));
                    return [4 /*yield*/, state.putAccount(address, account)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=runBlock.js.map
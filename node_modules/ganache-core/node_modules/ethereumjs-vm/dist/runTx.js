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
var ethereumjs_account_1 = require("ethereumjs-account");
var bloom_1 = require("./bloom");
var evm_1 = require("./evm/evm");
var message_1 = require("./evm/message");
var txContext_1 = require("./evm/txContext");
var Block = require('ethereumjs-block');
/**
 * @ignore
 */
function runTx(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var state, result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (opts === undefined) {
                        throw new Error('invalid input, opts must be provided');
                    }
                    // tx is required
                    if (!opts.tx) {
                        throw new Error('invalid input, tx is required');
                    }
                    // create a reasonable default if no block is given
                    if (!opts.block) {
                        opts.block = new Block();
                    }
                    if (new BN(opts.block.header.gasLimit).lt(new BN(opts.tx.gasLimit))) {
                        throw new Error('tx has a higher gas limit than the block');
                    }
                    state = this.pStateManager;
                    return [4 /*yield*/, state.checkpoint()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 7]);
                    return [4 /*yield*/, _runTx.bind(this)(opts)];
                case 3:
                    result = _a.sent();
                    return [4 /*yield*/, state.commit()];
                case 4:
                    _a.sent();
                    return [2 /*return*/, result];
                case 5:
                    e_1 = _a.sent();
                    return [4 /*yield*/, state.revert()];
                case 6:
                    _a.sent();
                    throw e_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.default = runTx;
function _runTx(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var block, tx, state, basefee, gasLimit, fromAccount, txContext, message, evm, results, gasRefund, finalFromBalance, minerAccount, keys, _i, keys_1, k;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    block = opts.block;
                    tx = opts.tx;
                    state = this.pStateManager;
                    /**
                     * The `beforeTx` event
                     *
                     * @event Event: beforeTx
                     * @type {Object}
                     * @property {Transaction} tx emits the Transaction that is about to be processed
                     */
                    return [4 /*yield*/, this._emit('beforeTx', tx)
                        // Validate gas limit against base fee
                    ];
                case 1:
                    /**
                     * The `beforeTx` event
                     *
                     * @event Event: beforeTx
                     * @type {Object}
                     * @property {Transaction} tx emits the Transaction that is about to be processed
                     */
                    _a.sent();
                    basefee = tx.getBaseFee();
                    gasLimit = new BN(tx.gasLimit);
                    if (gasLimit.lt(basefee)) {
                        throw new Error('base fee exceeds gas limit');
                    }
                    gasLimit.isub(basefee);
                    return [4 /*yield*/, state.getAccount(tx.getSenderAddress())];
                case 2:
                    fromAccount = _a.sent();
                    if (!opts.skipBalance && new BN(fromAccount.balance).lt(tx.getUpfrontCost())) {
                        throw new Error("sender doesn't have enough funds to send tx. The upfront cost is: " + tx
                            .getUpfrontCost()
                            .toString() +
                            (" and the sender's account only has: " + new BN(fromAccount.balance).toString()));
                    }
                    else if (!opts.skipNonce && !new BN(fromAccount.nonce).eq(new BN(tx.nonce))) {
                        throw new Error("the tx doesn't have the correct nonce. account has nonce of: " + new BN(fromAccount.nonce).toString() + " tx has nonce of: " + new BN(tx.nonce).toString());
                    }
                    // Update from account's nonce and balance
                    fromAccount.nonce = ethereumjs_util_1.toBuffer(new BN(fromAccount.nonce).addn(1));
                    fromAccount.balance = ethereumjs_util_1.toBuffer(new BN(fromAccount.balance).sub(new BN(tx.gasLimit).mul(new BN(tx.gasPrice))));
                    return [4 /*yield*/, state.putAccount(tx.getSenderAddress(), fromAccount)
                        /*
                         * Execute message
                         */
                    ];
                case 3:
                    _a.sent();
                    txContext = new txContext_1.default(tx.gasPrice, tx.getSenderAddress());
                    message = new message_1.default({
                        caller: tx.getSenderAddress(),
                        gasLimit: gasLimit,
                        to: tx.to.toString('hex') !== '' ? tx.to : undefined,
                        value: tx.value,
                        data: tx.data,
                    });
                    state._wrapped._clearOriginalStorageCache();
                    evm = new evm_1.default(this, txContext, block);
                    return [4 /*yield*/, evm.executeMessage(message)];
                case 4:
                    results = (_a.sent());
                    /*
                     * Parse results
                     */
                    // Generate the bloom for the tx
                    results.bloom = txLogsBloom(results.execResult.logs);
                    // Caculate the total gas used
                    results.gasUsed = results.gasUsed.add(basefee);
                    gasRefund = evm._refund;
                    if (gasRefund) {
                        if (gasRefund.lt(results.gasUsed.divn(2))) {
                            results.gasUsed.isub(gasRefund);
                        }
                        else {
                            results.gasUsed.isub(results.gasUsed.divn(2));
                        }
                    }
                    results.amountSpent = results.gasUsed.mul(new BN(tx.gasPrice));
                    return [4 /*yield*/, state.getAccount(tx.getSenderAddress())];
                case 5:
                    // Update sender's balance
                    fromAccount = _a.sent();
                    finalFromBalance = new BN(tx.gasLimit)
                        .sub(results.gasUsed)
                        .mul(new BN(tx.gasPrice))
                        .add(new BN(fromAccount.balance));
                    fromAccount.balance = ethereumjs_util_1.toBuffer(finalFromBalance);
                    return [4 /*yield*/, state.putAccount(ethereumjs_util_1.toBuffer(tx.getSenderAddress()), fromAccount)
                        // Update miner's balance
                    ];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, state.getAccount(block.header.coinbase)
                        // add the amount spent on gas to the miner's account
                    ];
                case 7:
                    minerAccount = _a.sent();
                    // add the amount spent on gas to the miner's account
                    minerAccount.balance = ethereumjs_util_1.toBuffer(new BN(minerAccount.balance).add(results.amountSpent));
                    if (!!new BN(minerAccount.balance).isZero()) return [3 /*break*/, 9];
                    return [4 /*yield*/, state.putAccount(block.header.coinbase, minerAccount)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    if (!results.execResult.selfdestruct) return [3 /*break*/, 13];
                    keys = Object.keys(results.execResult.selfdestruct);
                    _i = 0, keys_1 = keys;
                    _a.label = 10;
                case 10:
                    if (!(_i < keys_1.length)) return [3 /*break*/, 13];
                    k = keys_1[_i];
                    return [4 /*yield*/, state.putAccount(Buffer.from(k, 'hex'), new ethereumjs_account_1.default())];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 10];
                case 13: return [4 /*yield*/, state.cleanupTouchedAccounts()
                    /**
                     * The `afterTx` event
                     *
                     * @event Event: afterTx
                     * @type {Object}
                     * @property {Object} result result of the transaction
                     */
                ];
                case 14:
                    _a.sent();
                    /**
                     * The `afterTx` event
                     *
                     * @event Event: afterTx
                     * @type {Object}
                     * @property {Object} result result of the transaction
                     */
                    return [4 /*yield*/, this._emit('afterTx', results)];
                case 15:
                    /**
                     * The `afterTx` event
                     *
                     * @event Event: afterTx
                     * @type {Object}
                     * @property {Object} result result of the transaction
                     */
                    _a.sent();
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * @method txLogsBloom
 * @private
 */
function txLogsBloom(logs) {
    var bloom = new bloom_1.default();
    if (logs) {
        for (var i = 0; i < logs.length; i++) {
            var log = logs[i];
            // add the address
            bloom.add(log[0]);
            // add the topics
            var topics = log[1];
            for (var q = 0; q < topics.length; q++) {
                bloom.add(topics[q]);
            }
        }
    }
    return bloom;
}
//# sourceMappingURL=runTx.js.map
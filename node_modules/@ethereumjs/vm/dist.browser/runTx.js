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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTxReceipt = void 0;
var debug_1 = require("debug");
var ethereumjs_util_1 = require("ethereumjs-util");
var block_1 = require("@ethereumjs/block");
var common_1 = require("@ethereumjs/common");
var tx_1 = require("@ethereumjs/tx");
var bloom_1 = __importDefault(require("./bloom"));
var evm_1 = __importDefault(require("./evm/evm"));
var util_1 = require("./evm/opcodes/util");
var message_1 = __importDefault(require("./evm/message"));
var txContext_1 = __importDefault(require("./evm/txContext"));
var precompiles_1 = require("./evm/precompiles");
var debug = (0, debug_1.debug)('vm:tx');
var debugGas = (0, debug_1.debug)('vm:tx:gas');
/**
 * @ignore
 */
function runTx(opts) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var msg, state, msg, msg, msg, msg, castedTx, result, tx, removed, onlyStorage, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // tx is required
                    if (!opts.tx) {
                        throw new Error('invalid input, tx is required');
                    }
                    // create a reasonable default if no block is given
                    opts.block = (_a = opts.block) !== null && _a !== void 0 ? _a : block_1.Block.fromBlockData({}, { common: opts.tx.common });
                    if (opts.skipBlockGasLimitValidation !== true &&
                        opts.block.header.gasLimit.lt(opts.tx.gasLimit)) {
                        msg = _errorMsg('tx has a higher gas limit than the block', this, opts.block, opts.tx);
                        throw new Error(msg);
                    }
                    state = this.stateManager;
                    if (opts.reportAccessList && !('generateAccessList' in state)) {
                        msg = _errorMsg('reportAccessList needs a StateManager implementing the generateAccessList() method', this, opts.block, opts.tx);
                        throw new Error(msg);
                    }
                    // Ensure we start with a clear warmed accounts Map
                    if (this._common.isActivatedEIP(2929)) {
                        state.clearWarmedAccounts();
                    }
                    return [4 /*yield*/, state.checkpoint()];
                case 1:
                    _b.sent();
                    if (this.DEBUG) {
                        debug('-'.repeat(100));
                        debug("tx checkpoint");
                    }
                    if (!(opts.tx.supports(tx_1.Capability.EIP2718TypedTransaction) && this._common.isActivatedEIP(2718))) return [3 /*break*/, 8];
                    if (!!this._common.isActivatedEIP(2930)) return [3 /*break*/, 3];
                    return [4 /*yield*/, state.revert()];
                case 2:
                    _b.sent();
                    msg = _errorMsg('Cannot run transaction: EIP 2930 is not activated.', this, opts.block, opts.tx);
                    throw new Error(msg);
                case 3:
                    if (!(opts.reportAccessList && !('generateAccessList' in state))) return [3 /*break*/, 5];
                    return [4 /*yield*/, state.revert()];
                case 4:
                    _b.sent();
                    msg = _errorMsg('StateManager needs to implement generateAccessList() when running with reportAccessList option', this, opts.block, opts.tx);
                    throw new Error(msg);
                case 5:
                    if (!(opts.tx.supports(tx_1.Capability.EIP1559FeeMarket) && !this._common.isActivatedEIP(1559))) return [3 /*break*/, 7];
                    return [4 /*yield*/, state.revert()];
                case 6:
                    _b.sent();
                    msg = _errorMsg('Cannot run transaction: EIP 1559 is not activated.', this, opts.block, opts.tx);
                    throw new Error(msg);
                case 7:
                    castedTx = opts.tx;
                    castedTx.AccessListJSON.forEach(function (accessListItem) {
                        var address = (0, ethereumjs_util_1.toBuffer)(accessListItem.address);
                        state.addWarmedAddress(address);
                        accessListItem.storageKeys.forEach(function (storageKey) {
                            state.addWarmedStorage(address, (0, ethereumjs_util_1.toBuffer)(storageKey));
                        });
                    });
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 11, 13, 14]);
                    return [4 /*yield*/, _runTx.bind(this)(opts)];
                case 9:
                    result = _b.sent();
                    return [4 /*yield*/, state.commit()];
                case 10:
                    _b.sent();
                    if (this.DEBUG) {
                        debug("tx checkpoint committed");
                    }
                    if (this._common.isActivatedEIP(2929) && opts.reportAccessList) {
                        tx = opts.tx;
                        removed = [tx.getSenderAddress()];
                        onlyStorage = tx.to ? [tx.to] : [];
                        result.accessList = state.generateAccessList(removed, onlyStorage);
                    }
                    return [2 /*return*/, result];
                case 11:
                    e_1 = _b.sent();
                    return [4 /*yield*/, state.revert()];
                case 12:
                    _b.sent();
                    if (this.DEBUG) {
                        debug("tx checkpoint reverted");
                    }
                    throw e_1;
                case 13:
                    if (this._common.isActivatedEIP(2929)) {
                        state.clearWarmedAccounts();
                    }
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.default = runTx;
function _runTx(opts) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var state, tx, block, caller, txBaseFee, gasLimit, msg, maxFeePerGas, baseFeePerGas, msg, fromAccount, nonce, balance, cost, msg, cost_1, msg, msg, gasPrice, inclusionFeePerGas, baseFee, baseFee, txCost, txContext, value, data, to, message, evm, results, gasRefund, maxRefundQuotient, maxRefund, actualTxCost, txCostDiff, miner, minerAccount, keys, keys_1, keys_1_1, k, address, e_2_1, cumulativeGasUsed, _d, event;
        var e_2, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    state = this.stateManager;
                    tx = opts.tx, block = opts.block;
                    if (!block) {
                        throw new Error('block required');
                    }
                    /**
                     * The `beforeTx` event
                     *
                     * @event Event: beforeTx
                     * @type {Object}
                     * @property {Transaction} tx emits the Transaction that is about to be processed
                     */
                    return [4 /*yield*/, this._emit('beforeTx', tx)];
                case 1:
                    /**
                     * The `beforeTx` event
                     *
                     * @event Event: beforeTx
                     * @type {Object}
                     * @property {Transaction} tx emits the Transaction that is about to be processed
                     */
                    _f.sent();
                    caller = tx.getSenderAddress();
                    if (this.DEBUG) {
                        debug("New tx run hash=" + (opts.tx.isSigned() ? opts.tx.hash().toString('hex') : 'unsigned') + " sender=" + caller);
                    }
                    if (this._common.isActivatedEIP(2929)) {
                        // Add origin and precompiles to warm addresses
                        (0, precompiles_1.getActivePrecompiles)(this._common).forEach(function (address) {
                            return state.addWarmedAddress(address.buf);
                        });
                        state.addWarmedAddress(caller.buf);
                        if (tx.to) {
                            // Note: in case we create a contract, we do this in EVMs `_executeCreate` (this is also correct in inner calls, per the EIP)
                            state.addWarmedAddress(tx.to.buf);
                        }
                    }
                    txBaseFee = tx.getBaseFee();
                    gasLimit = tx.gasLimit.clone();
                    if (gasLimit.lt(txBaseFee)) {
                        msg = _errorMsg('base fee exceeds gas limit', this, block, tx);
                        throw new Error(msg);
                    }
                    gasLimit.isub(txBaseFee);
                    if (this.DEBUG) {
                        debugGas("Subtracting base fee (" + txBaseFee + ") from gasLimit (-> " + gasLimit + ")");
                    }
                    if (this._common.isActivatedEIP(1559)) {
                        maxFeePerGas = 'maxFeePerGas' in tx ? tx.maxFeePerGas : tx.gasPrice;
                        baseFeePerGas = block.header.baseFeePerGas;
                        if (maxFeePerGas.lt(baseFeePerGas)) {
                            msg = _errorMsg("Transaction's maxFeePerGas (" + maxFeePerGas + ") is less than the block's baseFeePerGas (" + baseFeePerGas + ")", this, block, tx);
                            throw new Error(msg);
                        }
                    }
                    return [4 /*yield*/, state.getAccount(caller)];
                case 2:
                    fromAccount = _f.sent();
                    nonce = fromAccount.nonce, balance = fromAccount.balance;
                    if (!opts.skipBalance) {
                        cost = tx.getUpfrontCost(block.header.baseFeePerGas);
                        if (balance.lt(cost)) {
                            msg = _errorMsg("sender doesn't have enough funds to send tx. The upfront cost is: " + cost + " and the sender's account (" + caller + ") only has: " + balance, this, block, tx);
                            throw new Error(msg);
                        }
                        if (tx.supports(tx_1.Capability.EIP1559FeeMarket)) {
                            cost_1 = tx.gasLimit.mul(tx.maxFeePerGas).add(tx.value);
                            if (balance.lt(cost_1)) {
                                msg = _errorMsg("sender doesn't have enough funds to send tx. The max cost is: " + cost_1 + " and the sender's account (" + caller + ") only has: " + balance, this, block, tx);
                                throw new Error(msg);
                            }
                        }
                    }
                    if (!opts.skipNonce) {
                        if (!nonce.eq(tx.nonce)) {
                            msg = _errorMsg("the tx doesn't have the correct nonce. account has nonce of: " + nonce + " tx has nonce of: " + tx.nonce, this, block, tx);
                            throw new Error(msg);
                        }
                    }
                    // EIP-1559 tx
                    if (tx.supports(tx_1.Capability.EIP1559FeeMarket)) {
                        baseFee = block.header.baseFeePerGas;
                        inclusionFeePerGas = ethereumjs_util_1.BN.min(tx.maxPriorityFeePerGas, tx.maxFeePerGas.sub(baseFee));
                        gasPrice = inclusionFeePerGas.add(baseFee);
                    }
                    else {
                        // Have to cast as legacy tx since EIP1559 tx does not have gas price
                        gasPrice = tx.gasPrice;
                        if (this._common.isActivatedEIP(1559)) {
                            baseFee = block.header.baseFeePerGas;
                            inclusionFeePerGas = tx.gasPrice.sub(baseFee);
                        }
                    }
                    // Update from account's nonce and balance
                    fromAccount.nonce.iaddn(1);
                    txCost = tx.gasLimit.mul(gasPrice);
                    fromAccount.balance.isub(txCost);
                    return [4 /*yield*/, state.putAccount(caller, fromAccount)];
                case 3:
                    _f.sent();
                    if (this.DEBUG) {
                        debug("Update fromAccount (caller) nonce (-> " + fromAccount.nonce + ") and balance(-> " + fromAccount.balance + ")");
                    }
                    txContext = new txContext_1.default(gasPrice, caller);
                    value = tx.value, data = tx.data, to = tx.to;
                    message = new message_1.default({
                        caller: caller,
                        gasLimit: gasLimit,
                        to: to,
                        value: value,
                        data: data,
                    });
                    evm = new evm_1.default(this, txContext, block);
                    if (this.DEBUG) {
                        debug("Running tx=0x" + (tx.isSigned() ? tx.hash().toString('hex') : 'unsigned') + " with caller=" + caller + " gasLimit=" + gasLimit + " to=" + (to ? to.toString() : '') + " value=" + value + " data=0x" + (0, util_1.short)(data));
                    }
                    return [4 /*yield*/, evm.executeMessage(message)];
                case 4:
                    results = (_f.sent());
                    if (this.DEBUG) {
                        debug('-'.repeat(100));
                        debug("Received tx results gasUsed=" + results.gasUsed + " execResult: [ gasUsed=" + results.gasUsed + " exceptionError=" + (results.execResult.exceptionError ? results.execResult.exceptionError.error : '') + " returnValue=" + (0, util_1.short)(results.execResult.returnValue) + " gasRefund=" + results.execResult.gasRefund + " ]");
                    }
                    /*
                     * Parse results
                     */
                    // Generate the bloom for the tx
                    results.bloom = txLogsBloom(results.execResult.logs);
                    if (this.DEBUG) {
                        debug("Generated tx bloom with logs=" + ((_a = results.execResult.logs) === null || _a === void 0 ? void 0 : _a.length));
                    }
                    // Caculate the total gas used
                    results.gasUsed.iadd(txBaseFee);
                    if (this.DEBUG) {
                        debugGas("tx add baseFee " + txBaseFee + " to gasUsed (-> " + results.gasUsed + ")");
                    }
                    gasRefund = (_b = results.execResult.gasRefund) !== null && _b !== void 0 ? _b : new ethereumjs_util_1.BN(0);
                    maxRefundQuotient = this._common.param('gasConfig', 'maxRefundQuotient');
                    if (!gasRefund.isZero()) {
                        maxRefund = results.gasUsed.divn(maxRefundQuotient);
                        gasRefund = ethereumjs_util_1.BN.min(gasRefund, maxRefund);
                        results.gasUsed.isub(gasRefund);
                        if (this.DEBUG) {
                            debug("Subtract tx gasRefund (" + gasRefund + ") from gasUsed (-> " + results.gasUsed + ")");
                        }
                    }
                    else {
                        if (this.DEBUG) {
                            debug("No tx gasRefund");
                        }
                    }
                    results.amountSpent = results.gasUsed.mul(gasPrice);
                    return [4 /*yield*/, state.getAccount(caller)];
                case 5:
                    // Update sender's balance
                    fromAccount = _f.sent();
                    actualTxCost = results.gasUsed.mul(gasPrice);
                    txCostDiff = txCost.sub(actualTxCost);
                    fromAccount.balance.iadd(txCostDiff);
                    return [4 /*yield*/, state.putAccount(caller, fromAccount)];
                case 6:
                    _f.sent();
                    if (this.DEBUG) {
                        debug("Refunded txCostDiff (" + txCostDiff + ") to fromAccount (caller) balance (-> " + fromAccount.balance + ")");
                    }
                    if (this._common.consensusType() === common_1.ConsensusType.ProofOfAuthority) {
                        // Backwards-compatibilty check
                        // TODO: can be removed along VM v6 release
                        if ('cliqueSigner' in block.header) {
                            miner = block.header.cliqueSigner();
                        }
                        else {
                            miner = ethereumjs_util_1.Address.zero();
                        }
                    }
                    else {
                        miner = block.header.coinbase;
                    }
                    return [4 /*yield*/, state.getAccount(miner)
                        // add the amount spent on gas to the miner's account
                    ];
                case 7:
                    minerAccount = _f.sent();
                    // add the amount spent on gas to the miner's account
                    if (this._common.isActivatedEIP(1559)) {
                        minerAccount.balance.iadd(results.gasUsed.mul(inclusionFeePerGas));
                    }
                    else {
                        minerAccount.balance.iadd(results.amountSpent);
                    }
                    // Put the miner account into the state. If the balance of the miner account remains zero, note that
                    // the state.putAccount function puts this into the "touched" accounts. This will thus be removed when
                    // we clean the touched accounts below in case we are in a fork >= SpuriousDragon
                    return [4 /*yield*/, state.putAccount(miner, minerAccount)];
                case 8:
                    // Put the miner account into the state. If the balance of the miner account remains zero, note that
                    // the state.putAccount function puts this into the "touched" accounts. This will thus be removed when
                    // we clean the touched accounts below in case we are in a fork >= SpuriousDragon
                    _f.sent();
                    if (this.DEBUG) {
                        debug("tx update miner account (" + miner + ") balance (-> " + minerAccount.balance + ")");
                    }
                    if (!results.execResult.selfdestruct) return [3 /*break*/, 16];
                    keys = Object.keys(results.execResult.selfdestruct);
                    _f.label = 9;
                case 9:
                    _f.trys.push([9, 14, 15, 16]);
                    keys_1 = __values(keys), keys_1_1 = keys_1.next();
                    _f.label = 10;
                case 10:
                    if (!!keys_1_1.done) return [3 /*break*/, 13];
                    k = keys_1_1.value;
                    address = new ethereumjs_util_1.Address(Buffer.from(k, 'hex'));
                    return [4 /*yield*/, state.deleteAccount(address)];
                case 11:
                    _f.sent();
                    if (this.DEBUG) {
                        debug("tx selfdestruct on address=" + address);
                    }
                    _f.label = 12;
                case 12:
                    keys_1_1 = keys_1.next();
                    return [3 /*break*/, 10];
                case 13: return [3 /*break*/, 16];
                case 14:
                    e_2_1 = _f.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 16];
                case 15:
                    try {
                        if (keys_1_1 && !keys_1_1.done && (_e = keys_1.return)) _e.call(keys_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 16: return [4 /*yield*/, state.cleanupTouchedAccounts()];
                case 17:
                    _f.sent();
                    state.clearOriginalStorageCache();
                    cumulativeGasUsed = ((_c = opts.blockGasUsed) !== null && _c !== void 0 ? _c : block.header.gasUsed).add(results.gasUsed);
                    _d = results;
                    return [4 /*yield*/, generateTxReceipt.bind(this)(tx, results, cumulativeGasUsed)
                        /**
                         * The `afterTx` event
                         *
                         * @event Event: afterTx
                         * @type {Object}
                         * @property {Object} result result of the transaction
                         */
                    ];
                case 18:
                    _d.receipt = _f.sent();
                    event = __assign({ transaction: tx }, results);
                    return [4 /*yield*/, this._emit('afterTx', event)];
                case 19:
                    _f.sent();
                    if (this.DEBUG) {
                        debug("tx run finished hash=" + (opts.tx.isSigned() ? opts.tx.hash().toString('hex') : 'unsigned') + " sender=" + caller);
                    }
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
/**
 * Returns the tx receipt.
 * @param this The vm instance
 * @param tx The transaction
 * @param txResult The tx result
 * @param cumulativeGasUsed The gas used in the block including this tx
 */
function generateTxReceipt(tx, txResult, cumulativeGasUsed) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var baseReceipt, receipt, stateRoot;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    baseReceipt = {
                        gasUsed: cumulativeGasUsed.toArrayLike(Buffer),
                        bitvector: txResult.bloom.bitvector,
                        logs: (_a = txResult.execResult.logs) !== null && _a !== void 0 ? _a : [],
                    };
                    if (this.DEBUG) {
                        debug("Generate tx receipt transactionType=" + tx.type + " gasUsed=" + cumulativeGasUsed + " bitvector=" + (0, util_1.short)(baseReceipt.bitvector) + " (" + baseReceipt.bitvector.length + " bytes) logs=" + baseReceipt.logs.length);
                    }
                    if (!!tx.supports(tx_1.Capability.EIP2718TypedTransaction)) return [3 /*break*/, 4];
                    if (!this._common.gteHardfork('byzantium')) return [3 /*break*/, 1];
                    // Post-Byzantium
                    receipt = __assign({ status: txResult.execResult.exceptionError ? 0 : 1 }, baseReceipt);
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, this.stateManager.getStateRoot(true)];
                case 2:
                    stateRoot = _b.sent();
                    receipt = __assign({ stateRoot: stateRoot }, baseReceipt);
                    _b.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    // Typed EIP-2718 Transaction
                    receipt = __assign({ status: txResult.execResult.exceptionError ? 0 : 1 }, baseReceipt);
                    _b.label = 5;
                case 5: return [2 /*return*/, receipt];
            }
        });
    });
}
exports.generateTxReceipt = generateTxReceipt;
/**
 * Internal helper function to create an annotated error message
 *
 * @param msg Base error message
 * @hidden
 */
function _errorMsg(msg, vm, block, tx) {
    var blockErrorStr = 'errorStr' in block ? block.errorStr() : 'block';
    var txErrorStr = 'errorStr' in tx ? tx.errorStr() : 'tx';
    var errorMsg = msg + " (" + vm.errorStr() + " -> " + blockErrorStr + " -> " + txErrorStr + ")";
    return errorMsg;
}
//# sourceMappingURL=runTx.js.map
"use strict";
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
var tx_1 = require("@ethereumjs/tx");
var ethereumjs_util_1 = require("ethereumjs-util");
var index_1 = require("./index");
var helpers_1 = require("./helpers");
var header_from_rpc_1 = __importDefault(require("./header-from-rpc"));
function normalizeTxParams(_txParams) {
    var txParams = Object.assign({}, _txParams);
    txParams.gasLimit = txParams.gasLimit === undefined ? txParams.gas : txParams.gasLimit;
    txParams.data = txParams.data === undefined ? txParams.input : txParams.data;
    // check and convert gasPrice and value params
    txParams.gasPrice = (0, helpers_1.numberToHex)(txParams.gasPrice);
    txParams.value = (0, helpers_1.numberToHex)(txParams.value);
    // strict byte length checking
    txParams.to = txParams.to ? (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.toBuffer)(txParams.to), 20) : null;
    // v as raw signature value {0,1}
    // v is the recovery bit and can be either {0,1} or {27,28}.
    // https://ethereum.stackexchange.com/questions/40679/why-the-value-of-v-is-always-either-27-11011-or-28-11100
    var v = txParams.v;
    txParams.v = v < 27 ? v + 27 : v;
    return txParams;
}
/**
 * Creates a new block object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param uncles - Optional list of Ethereum JSON RPC of uncles (eth_getUncleByBlockHashAndIndex)
 * @param chainOptions - An object describing the blockchain
 */
function blockFromRpc(blockParams, uncles, options) {
    var e_1, _a;
    if (uncles === void 0) { uncles = []; }
    var header = (0, header_from_rpc_1.default)(blockParams, options);
    var transactions = [];
    if (blockParams.transactions) {
        var opts = { common: header._common };
        try {
            for (var _b = __values(blockParams.transactions), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _txParams = _c.value;
                var txParams = normalizeTxParams(_txParams);
                var tx = tx_1.TransactionFactory.fromTxData(txParams, opts);
                transactions.push(tx);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    var uncleHeaders = uncles.map(function (uh) { return (0, header_from_rpc_1.default)(uh, options); });
    return index_1.Block.fromBlockData({ header: header, transactions: transactions, uncleHeaders: uncleHeaders }, options);
}
exports.default = blockFromRpc;
//# sourceMappingURL=from-rpc.js.map
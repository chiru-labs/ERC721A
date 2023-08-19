"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tx_1 = require("@ethereumjs/tx");
const ethereumjs_util_1 = require("ethereumjs-util");
const index_1 = require("./index");
const helpers_1 = require("./helpers");
const header_from_rpc_1 = __importDefault(require("./header-from-rpc"));
function normalizeTxParams(_txParams) {
    const txParams = Object.assign({}, _txParams);
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
    const v = txParams.v;
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
function blockFromRpc(blockParams, uncles = [], options) {
    const header = (0, header_from_rpc_1.default)(blockParams, options);
    const transactions = [];
    if (blockParams.transactions) {
        const opts = { common: header._common };
        for (const _txParams of blockParams.transactions) {
            const txParams = normalizeTxParams(_txParams);
            const tx = tx_1.TransactionFactory.fromTxData(txParams, opts);
            transactions.push(tx);
        }
    }
    const uncleHeaders = uncles.map((uh) => (0, header_from_rpc_1.default)(uh, options));
    return index_1.Block.fromBlockData({ header, transactions, uncleHeaders }, options);
}
exports.default = blockFromRpc;
//# sourceMappingURL=from-rpc.js.map
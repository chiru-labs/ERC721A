"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var header_1 = require("./header");
var helpers_1 = require("./helpers");
/**
 * Creates a new block header object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param chainOptions - An object describing the blockchain
 */
function blockHeaderFromRpc(blockParams, options) {
    var parentHash = blockParams.parentHash, sha3Uncles = blockParams.sha3Uncles, miner = blockParams.miner, stateRoot = blockParams.stateRoot, transactionsRoot = blockParams.transactionsRoot, receiptRoot = blockParams.receiptRoot, receiptsRoot = blockParams.receiptsRoot, logsBloom = blockParams.logsBloom, difficulty = blockParams.difficulty, number = blockParams.number, gasLimit = blockParams.gasLimit, gasUsed = blockParams.gasUsed, timestamp = blockParams.timestamp, extraData = blockParams.extraData, mixHash = blockParams.mixHash, nonce = blockParams.nonce, baseFeePerGas = blockParams.baseFeePerGas;
    var blockHeader = header_1.BlockHeader.fromHeaderData({
        parentHash: parentHash,
        uncleHash: sha3Uncles,
        coinbase: miner,
        stateRoot: stateRoot,
        transactionsTrie: transactionsRoot,
        receiptTrie: receiptRoot || receiptsRoot,
        logsBloom: logsBloom,
        difficulty: (0, helpers_1.numberToHex)(difficulty),
        number: number,
        gasLimit: gasLimit,
        gasUsed: gasUsed,
        timestamp: timestamp,
        extraData: extraData,
        mixHash: mixHash,
        nonce: nonce,
        baseFeePerGas: baseFeePerGas,
    }, options);
    return blockHeader;
}
exports.default = blockHeaderFromRpc;
//# sourceMappingURL=header-from-rpc.js.map
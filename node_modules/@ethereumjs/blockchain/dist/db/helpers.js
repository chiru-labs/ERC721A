"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBSaveLookups = exports.DBSetHashToNumber = exports.DBSetBlockOrHeader = exports.DBSetTD = exports.DBOp = void 0;
const operation_1 = require("./operation");
Object.defineProperty(exports, "DBOp", { enumerable: true, get: function () { return operation_1.DBOp; } });
const ethereumjs_util_1 = require("ethereumjs-util");
const block_1 = require("@ethereumjs/block");
const constants_1 = require("./constants");
/*
 * This extra helper file serves as an interface between the blockchain API functionality
 * and the DB operations from `db/operation.ts` and also handles the right encoding of the keys
 */
function DBSetTD(TD, blockNumber, blockHash) {
    return operation_1.DBOp.set(operation_1.DBTarget.TotalDifficulty, ethereumjs_util_1.rlp.encode(TD), {
        blockNumber,
        blockHash,
    });
}
exports.DBSetTD = DBSetTD;
/*
 * This method accepts either a BlockHeader or a Block and returns a list of DatabaseOperation instances
 *
 * - A "Set Header Operation" is always added
 * - A "Set Body Operation" is only added if the body is not empty (it has transactions/uncles) or if the block is the genesis block
 * (if there is a header but no block saved the DB will implicitly assume the block to be empty)
 */
function DBSetBlockOrHeader(blockBody) {
    const header = blockBody instanceof block_1.Block ? blockBody.header : blockBody;
    const dbOps = [];
    const blockNumber = header.number;
    const blockHash = header.hash();
    const headerValue = header.serialize();
    dbOps.push(operation_1.DBOp.set(operation_1.DBTarget.Header, headerValue, {
        blockNumber,
        blockHash,
    }));
    const isGenesis = header.number.eqn(0);
    if (isGenesis ||
        (blockBody instanceof block_1.Block && (blockBody.transactions.length || blockBody.uncleHeaders.length))) {
        const bodyValue = ethereumjs_util_1.rlp.encode(blockBody.raw().slice(1));
        dbOps.push(operation_1.DBOp.set(operation_1.DBTarget.Body, bodyValue, {
            blockNumber,
            blockHash,
        }));
    }
    return dbOps;
}
exports.DBSetBlockOrHeader = DBSetBlockOrHeader;
function DBSetHashToNumber(blockHash, blockNumber) {
    const blockNumber8Byte = (0, constants_1.bufBE8)(blockNumber);
    return operation_1.DBOp.set(operation_1.DBTarget.HashToNumber, blockNumber8Byte, {
        blockHash,
    });
}
exports.DBSetHashToNumber = DBSetHashToNumber;
function DBSaveLookups(blockHash, blockNumber) {
    const ops = [];
    ops.push(operation_1.DBOp.set(operation_1.DBTarget.NumberToHash, blockHash, { blockNumber }));
    const blockNumber8Bytes = (0, constants_1.bufBE8)(blockNumber);
    ops.push(operation_1.DBOp.set(operation_1.DBTarget.HashToNumber, blockNumber8Bytes, {
        blockHash,
    }));
    return ops;
}
exports.DBSaveLookups = DBSaveLookups;
//# sourceMappingURL=helpers.js.map
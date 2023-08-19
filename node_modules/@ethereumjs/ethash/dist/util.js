"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufReverse = exports.fnvBuffer = exports.fnv = exports.getSeed = exports.getEpoc = exports.getFullSize = exports.getCacheSize = exports.params = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const MR = require('miller-rabin');
exports.params = {
    DATASET_BYTES_INIT: 1073741824,
    DATASET_BYTES_GROWTH: 8388608,
    CACHE_BYTES_INIT: 16777216,
    CACHE_BYTES_GROWTH: 131072,
    CACHE_MULTIPLIER: 1024,
    EPOCH_LENGTH: 30000,
    MIX_BYTES: 128,
    HASH_BYTES: 64,
    DATASET_PARENTS: 256,
    CACHE_ROUNDS: 3,
    ACCESSES: 64,
    WORD_BYTES: 4,
};
function getCacheSize(epoc) {
    const mr = new MR();
    let sz = exports.params.CACHE_BYTES_INIT +
        exports.params.CACHE_BYTES_GROWTH * epoc;
    sz -= exports.params.HASH_BYTES;
    while (!mr.test(new ethereumjs_util_1.BN(sz / exports.params.HASH_BYTES))) {
        sz -= 2 * exports.params.HASH_BYTES;
    }
    return sz;
}
exports.getCacheSize = getCacheSize;
function getFullSize(epoc) {
    const mr = new MR();
    let sz = exports.params.DATASET_BYTES_INIT +
        exports.params.DATASET_BYTES_GROWTH * epoc;
    sz -= exports.params.MIX_BYTES;
    while (!mr.test(new ethereumjs_util_1.BN(sz / exports.params.MIX_BYTES))) {
        sz -= 2 * exports.params.MIX_BYTES;
    }
    return sz;
}
exports.getFullSize = getFullSize;
function getEpoc(blockNumber) {
    return Math.floor(blockNumber / exports.params.EPOCH_LENGTH);
}
exports.getEpoc = getEpoc;
/**
 * Generates a seed give the end epoc and optional the begining epoc and the
 * begining epoc seed
 * @method getSeed
 * @param seed Buffer
 * @param begin Number
 * @param end Number
 */
function getSeed(seed, begin, end) {
    for (let i = begin; i < end; i++) {
        seed = (0, ethereumjs_util_1.keccak256)(seed);
    }
    return seed;
}
exports.getSeed = getSeed;
function fnv(x, y) {
    return ((((x * 0x01000000) | 0) + ((x * 0x193) | 0)) ^ y) >>> 0;
}
exports.fnv = fnv;
function fnvBuffer(a, b) {
    const r = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i = i + 4) {
        r.writeUInt32LE(fnv(a.readUInt32LE(i), b.readUInt32LE(i)), i);
    }
    return r;
}
exports.fnvBuffer = fnvBuffer;
function bufReverse(a) {
    const length = a.length;
    const b = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
        b[i] = a[length - i - 1];
    }
    return b;
}
exports.bufReverse = bufReverse;
//# sourceMappingURL=util.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToNumberKey = exports.numberToHashKey = exports.bodyKey = exports.headerKey = exports.tdKey = exports.bufBE8 = exports.CLIQUE_BLOCK_SIGNERS_KEY = exports.CLIQUE_VOTES_KEY = exports.CLIQUE_SIGNERS_KEY = exports.HEAD_BLOCK_KEY = exports.HEAD_HEADER_KEY = exports.HEADS_KEY = void 0;
// Geth compatible DB keys
var HEADS_KEY = 'heads';
exports.HEADS_KEY = HEADS_KEY;
/**
 * Current canonical head for light sync
 */
var HEAD_HEADER_KEY = 'LastHeader';
exports.HEAD_HEADER_KEY = HEAD_HEADER_KEY;
/**
 * Current canonical head for full sync
 */
var HEAD_BLOCK_KEY = 'LastBlock';
exports.HEAD_BLOCK_KEY = HEAD_BLOCK_KEY;
/**
 * Cique signers
 */
var CLIQUE_SIGNERS_KEY = 'CliqueSigners';
exports.CLIQUE_SIGNERS_KEY = CLIQUE_SIGNERS_KEY;
/**
 * Clique votes
 */
var CLIQUE_VOTES_KEY = 'CliqueVotes';
exports.CLIQUE_VOTES_KEY = CLIQUE_VOTES_KEY;
/**
 * Cique block signers (snapshot)
 */
var CLIQUE_BLOCK_SIGNERS_KEY = 'CliqueBlockSignersSnapshot';
exports.CLIQUE_BLOCK_SIGNERS_KEY = CLIQUE_BLOCK_SIGNERS_KEY;
/**
 * headerPrefix + number + hash -> header
 */
var HEADER_PREFIX = Buffer.from('h');
/**
 * headerPrefix + number + hash + tdSuffix -> td
 */
var TD_SUFFIX = Buffer.from('t');
/**
 * headerPrefix + number + numSuffix -> hash
 */
var NUM_SUFFIX = Buffer.from('n');
/**
 * blockHashPrefix + hash -> number
 */
var BLOCK_HASH_PEFIX = Buffer.from('H');
/**
 * bodyPrefix + number + hash -> block body
 */
var BODY_PREFIX = Buffer.from('b');
// Utility functions
/**
 * Convert BN to big endian Buffer
 */
var bufBE8 = function (n) { return n.toArrayLike(Buffer, 'be', 8); };
exports.bufBE8 = bufBE8;
var tdKey = function (n, hash) { return Buffer.concat([HEADER_PREFIX, bufBE8(n), hash, TD_SUFFIX]); };
exports.tdKey = tdKey;
var headerKey = function (n, hash) { return Buffer.concat([HEADER_PREFIX, bufBE8(n), hash]); };
exports.headerKey = headerKey;
var bodyKey = function (n, hash) { return Buffer.concat([BODY_PREFIX, bufBE8(n), hash]); };
exports.bodyKey = bodyKey;
var numberToHashKey = function (n) { return Buffer.concat([HEADER_PREFIX, bufBE8(n), NUM_SUFFIX]); };
exports.numberToHashKey = numberToHashKey;
var hashToNumberKey = function (hash) { return Buffer.concat([BLOCK_HASH_PEFIX, hash]); };
exports.hashToNumberKey = hashToNumberKey;
//# sourceMappingURL=constants.js.map
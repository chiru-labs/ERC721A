"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToNumberKey = exports.numberToHashKey = exports.bodyKey = exports.headerKey = exports.tdKey = exports.bufBE8 = exports.CLIQUE_BLOCK_SIGNERS_KEY = exports.CLIQUE_VOTES_KEY = exports.CLIQUE_SIGNERS_KEY = exports.HEAD_BLOCK_KEY = exports.HEAD_HEADER_KEY = exports.HEADS_KEY = void 0;
// Geth compatible DB keys
const HEADS_KEY = 'heads';
exports.HEADS_KEY = HEADS_KEY;
/**
 * Current canonical head for light sync
 */
const HEAD_HEADER_KEY = 'LastHeader';
exports.HEAD_HEADER_KEY = HEAD_HEADER_KEY;
/**
 * Current canonical head for full sync
 */
const HEAD_BLOCK_KEY = 'LastBlock';
exports.HEAD_BLOCK_KEY = HEAD_BLOCK_KEY;
/**
 * Cique signers
 */
const CLIQUE_SIGNERS_KEY = 'CliqueSigners';
exports.CLIQUE_SIGNERS_KEY = CLIQUE_SIGNERS_KEY;
/**
 * Clique votes
 */
const CLIQUE_VOTES_KEY = 'CliqueVotes';
exports.CLIQUE_VOTES_KEY = CLIQUE_VOTES_KEY;
/**
 * Cique block signers (snapshot)
 */
const CLIQUE_BLOCK_SIGNERS_KEY = 'CliqueBlockSignersSnapshot';
exports.CLIQUE_BLOCK_SIGNERS_KEY = CLIQUE_BLOCK_SIGNERS_KEY;
/**
 * headerPrefix + number + hash -> header
 */
const HEADER_PREFIX = Buffer.from('h');
/**
 * headerPrefix + number + hash + tdSuffix -> td
 */
const TD_SUFFIX = Buffer.from('t');
/**
 * headerPrefix + number + numSuffix -> hash
 */
const NUM_SUFFIX = Buffer.from('n');
/**
 * blockHashPrefix + hash -> number
 */
const BLOCK_HASH_PEFIX = Buffer.from('H');
/**
 * bodyPrefix + number + hash -> block body
 */
const BODY_PREFIX = Buffer.from('b');
// Utility functions
/**
 * Convert BN to big endian Buffer
 */
const bufBE8 = (n) => n.toArrayLike(Buffer, 'be', 8);
exports.bufBE8 = bufBE8;
const tdKey = (n, hash) => Buffer.concat([HEADER_PREFIX, bufBE8(n), hash, TD_SUFFIX]);
exports.tdKey = tdKey;
const headerKey = (n, hash) => Buffer.concat([HEADER_PREFIX, bufBE8(n), hash]);
exports.headerKey = headerKey;
const bodyKey = (n, hash) => Buffer.concat([BODY_PREFIX, bufBE8(n), hash]);
exports.bodyKey = bodyKey;
const numberToHashKey = (n) => Buffer.concat([HEADER_PREFIX, bufBE8(n), NUM_SUFFIX]);
exports.numberToHashKey = numberToHashKey;
const hashToNumberKey = (hash) => Buffer.concat([BLOCK_HASH_PEFIX, hash]);
exports.hashToNumberKey = hashToNumberKey;
//# sourceMappingURL=constants.js.map
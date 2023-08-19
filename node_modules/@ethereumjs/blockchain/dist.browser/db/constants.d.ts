/// <reference types="node" />
import { BN } from 'ethereumjs-util';
declare const HEADS_KEY = "heads";
/**
 * Current canonical head for light sync
 */
declare const HEAD_HEADER_KEY = "LastHeader";
/**
 * Current canonical head for full sync
 */
declare const HEAD_BLOCK_KEY = "LastBlock";
/**
 * Cique signers
 */
declare const CLIQUE_SIGNERS_KEY = "CliqueSigners";
/**
 * Clique votes
 */
declare const CLIQUE_VOTES_KEY = "CliqueVotes";
/**
 * Cique block signers (snapshot)
 */
declare const CLIQUE_BLOCK_SIGNERS_KEY = "CliqueBlockSignersSnapshot";
/**
 * Convert BN to big endian Buffer
 */
declare const bufBE8: (n: BN) => Buffer;
declare const tdKey: (n: BN, hash: Buffer) => Buffer;
declare const headerKey: (n: BN, hash: Buffer) => Buffer;
declare const bodyKey: (n: BN, hash: Buffer) => Buffer;
declare const numberToHashKey: (n: BN) => Buffer;
declare const hashToNumberKey: (hash: Buffer) => Buffer;
/**
 * @hidden
 */
export { HEADS_KEY, HEAD_HEADER_KEY, HEAD_BLOCK_KEY, CLIQUE_SIGNERS_KEY, CLIQUE_VOTES_KEY, CLIQUE_BLOCK_SIGNERS_KEY, bufBE8, tdKey, headerKey, bodyKey, numberToHashKey, hashToNumberKey, };

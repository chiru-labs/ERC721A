/// <reference types="node" />
import BN = require('bn.js');
declare const headsKey = "heads";
/**
 * Current canonical head for light sync
 */
declare const headHeaderKey = "LastHeader";
/**
 * Current canonical head for full sync
 */
declare const headBlockKey = "LastBlock";
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
export { headsKey, headHeaderKey, headBlockKey, bufBE8, tdKey, headerKey, bodyKey, numberToHashKey, hashToNumberKey, };

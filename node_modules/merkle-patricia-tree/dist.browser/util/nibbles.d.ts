/// <reference types="node" />
import { Nibbles } from '../trieNode';
/**
 * Converts a buffer to a nibble array.
 * @private
 * @param key
 */
export declare function bufferToNibbles(key: Buffer): Nibbles;
/**
 * Converts a nibble array into a buffer.
 * @private
 * @param arr - Nibble array
 */
export declare function nibblesToBuffer(arr: Nibbles): Buffer;
/**
 * Returns the number of in order matching nibbles of two give nibble arrays.
 * @private
 * @param nib1
 * @param nib2
 */
export declare function matchingNibbleLength(nib1: Nibbles, nib2: Nibbles): number;
/**
 * Compare two nibble array keys.
 * @param keyA
 * @param keyB
 */
export declare function doKeysMatch(keyA: Nibbles, keyB: Nibbles): boolean;

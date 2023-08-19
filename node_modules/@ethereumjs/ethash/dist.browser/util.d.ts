/// <reference types="node" />
export declare const params: {
    DATASET_BYTES_INIT: number;
    DATASET_BYTES_GROWTH: number;
    CACHE_BYTES_INIT: number;
    CACHE_BYTES_GROWTH: number;
    CACHE_MULTIPLIER: number;
    EPOCH_LENGTH: number;
    MIX_BYTES: number;
    HASH_BYTES: number;
    DATASET_PARENTS: number;
    CACHE_ROUNDS: number;
    ACCESSES: number;
    WORD_BYTES: number;
};
export declare function getCacheSize(epoc: number): number;
export declare function getFullSize(epoc: number): number;
export declare function getEpoc(blockNumber: number): number;
/**
 * Generates a seed give the end epoc and optional the begining epoc and the
 * begining epoc seed
 * @method getSeed
 * @param seed Buffer
 * @param begin Number
 * @param end Number
 */
export declare function getSeed(seed: Buffer, begin: number, end: number): Buffer;
export declare function fnv(x: number, y: number): number;
export declare function fnvBuffer(a: Buffer, b: Buffer): Buffer;
export declare function bufReverse(a: Buffer): Buffer;

/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from 'ethereumjs-util';
import { Block, BlockHeader, BlockBodyBuffer } from '@ethereumjs/block';
import Common from '@ethereumjs/common';
import { CliqueLatestSignerStates, CliqueLatestVotes, CliqueLatestBlockSigners } from '../clique';
import Cache from './cache';
import { DatabaseKey, DBOp, DBTarget } from './operation';
import type { LevelUp } from 'levelup';
/**
 * @hidden
 */
export interface GetOpts {
    keyEncoding?: string;
    valueEncoding?: string;
    cache?: string;
}
export declare type CacheMap = {
    [key: string]: Cache<Buffer>;
};
/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
export declare class DBManager {
    private _cache;
    private _common;
    private _db;
    constructor(db: LevelUp, common: Common);
    /**
     * Fetches iterator heads from the db.
     */
    getHeads(): Promise<{
        [key: string]: Buffer;
    }>;
    /**
     * Fetches header of the head block.
     */
    getHeadHeader(): Promise<Buffer>;
    /**
     * Fetches head block.
     */
    getHeadBlock(): Promise<Buffer>;
    /**
     * Fetches clique signers.
     */
    getCliqueLatestSignerStates(): Promise<CliqueLatestSignerStates>;
    /**
     * Fetches clique votes.
     */
    getCliqueLatestVotes(): Promise<CliqueLatestVotes>;
    /**
     * Fetches snapshot of clique signers.
     */
    getCliqueLatestBlockSigners(): Promise<CliqueLatestBlockSigners>;
    /**
     * Fetches a block (header and body) given a block id,
     * which can be either its hash or its number.
     */
    getBlock(blockId: Buffer | BN | number): Promise<Block>;
    /**
     * Fetches body of a block given its hash and number.
     */
    getBody(blockHash: Buffer, blockNumber: BN): Promise<BlockBodyBuffer>;
    /**
     * Fetches header of a block given its hash and number.
     */
    getHeader(blockHash: Buffer, blockNumber: BN): Promise<BlockHeader>;
    /**
     * Fetches total difficulty for a block given its hash and number.
     */
    getTotalDifficulty(blockHash: Buffer, blockNumber: BN): Promise<BN>;
    /**
     * Performs a block hash to block number lookup.
     */
    hashToNumber(blockHash: Buffer): Promise<BN>;
    /**
     * Performs a block number to block hash lookup.
     */
    numberToHash(blockNumber: BN): Promise<Buffer>;
    /**
     * Fetches a key from the db. If `opts.cache` is specified
     * it first tries to load from cache, and on cache miss will
     * try to put the fetched item on cache afterwards.
     */
    get(dbOperationTarget: DBTarget, key?: DatabaseKey): Promise<any>;
    /**
     * Performs a batch operation on db.
     */
    batch(ops: DBOp[]): Promise<void>;
}

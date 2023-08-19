/// <reference types="node" />
import { BN } from 'ethereumjs-util';
import Common from 'ethereumjs-common';
import DBManager from './dbManager';
declare const Block: any;
export declare type Block = any;
export interface BlockchainInterface {
    /**
     * Adds a block to the blockchain.
     *
     * @param block - The block to be added to the blockchain.
     * @param cb - The callback. It is given two parameters `err` and the saved `block`
     * @param isGenesis - True if block is the genesis block.
     */
    putBlock(block: Block, cb: any, isGenesis?: boolean): void;
    /**
     * Deletes a block from the blockchain. All child blocks in the chain are deleted and any
     * encountered heads are set to the parent block.
     *
     * @param blockHash - The hash of the block to be deleted
     * @param cb - A callback.
     */
    delBlock(blockHash: Buffer, cb: any): void;
    /**
     * Returns a block by its hash or number.
     */
    getBlock(blockTag: Buffer | number | BN, cb: (err: Error | null, block?: Block) => void): void;
    /**
     * Iterates through blocks starting at the specified iterator head and calls the onBlock function
     * on each block.
     *
     * @param name - Name of the state root head
     * @param onBlock - Function called on each block with params (block, reorg, cb)
     * @param cb - A callback function
     */
    iterator(name: string, onBlock: any, cb: any): void;
    /**
     * This method is only here for backwards compatibility. It can be removed once
     * [this PR](https://github.com/ethereumjs/ethereumjs-block/pull/72/files) gets merged, released,
     * and ethereumjs-block is updated here.
     *
     * The method should just call `cb` with `null` as first argument.
     */
    getDetails(_: string, cb: any): void;
}
/**
 * This are the options that the Blockchain constructor can receive.
 */
export interface BlockchainOptions {
    /**
     * The chain id or name. Default: `"mainnet"`.
     */
    chain?: string | number;
    /**
     * Hardfork for the blocks. If `undefined` or `null` is passed, it gets computed based on block
     * numbers.
     */
    hardfork?: string | null;
    /**
     * An alternative way to specify the chain and hardfork is by passing a Common instance.
     */
    common?: Common;
    /**
     * Database to store blocks and metadata. Should be a
     * [levelup](https://github.com/rvagg/node-levelup) instance.
     */
    db?: any;
    /**
     * This the flag indicates if blocks and Proof-of-Work should be validated.
     * This option can't be used in conjunction with `validatePow` nor `validateBlocks`.
     *
     * @deprecated
     */
    validate?: boolean;
    /**
     * This flags indicates if Proof-of-work should be validated. If `validate` is provided, this
     * option takes its value. If neither `validate` nor this option are provided, it defaults to
     * `true`.
     */
    validatePow?: boolean;
    /**
     * This flags indicates if blocks should be validated. See Block#validate for details. If
     * `validate` is provided, this option takes its value. If neither `validate` nor this option are
     * provided, it defaults to `true`.
     */
    validateBlocks?: boolean;
}
/**
 * This class stores and interacts with blocks.
 */
export default class Blockchain implements BlockchainInterface {
    /**
     * @hidden
     */
    _common: Common;
    /**
     * @hidden
     */
    _genesis: any;
    /**
     * @hidden
     */
    _headBlock: any;
    /**
     * @hidden
     */
    _headHeader: any;
    /**
     * @hidden
     */
    _heads: any;
    /**
     * @hidden
     */
    _initDone: boolean;
    /**
     * @hidden
     */
    _initLock: any;
    /**
     * @hidden
     */
    _putSemaphore: any;
    /**
     * @hidden
     */
    _staleHeadBlock: any;
    /**
     * @hidden
     */
    _staleHeads: any;
    db: any;
    dbManager: DBManager;
    ethash: any;
    /**
     * This field is always `true`. It's here only for backwards compatibility.
     *
     * @deprecated
     */
    readonly validate: boolean;
    private readonly _validatePow;
    private readonly _validateBlocks;
    /**
     * Creates new Blockchain object
     *
     * @param opts - An object with the options that this constructor takes. See [[BlockchainOptions]].
     */
    constructor(opts?: BlockchainOptions);
    /**
     * Returns an object with metadata about the Blockchain. It's defined for backwards compatibility.
     */
    get meta(): {
        rawHead: any;
        heads: any;
        genesis: any;
    };
    /**
     * Fetches the meta info about the blockchain from the db. Meta info contains
     * hashes of the headerchain head, blockchain head, genesis block and iterator
     * heads.
     *
     * @hidden
     */
    _init(cb: any): void;
    /**
     * Sets the default genesis block
     *
     * @hidden
     */
    _setCanonicalGenesisBlock(cb: any): void;
    /**
     * Puts the genesis block in the database
     *
     * @param genesis - The genesis block to be added
     * @param cb - The callback. It is given two parameters `err` and the saved `block`
     */
    putGenesis(genesis: any, cb: any): void;
    /**
     * Returns the specified iterator head.
     *
     * @param name - Optional name of the state root head (default: 'vm')
     * @param cb - The callback. It is given two parameters `err` and the returned `block`
     */
    getHead(name: any, cb?: any): void;
    /**
     * Returns the latest header in the canonical chain.
     *
     * @param cb - The callback. It is given two parameters `err` and the returned `header`
     */
    getLatestHeader(cb: any): void;
    /**
     * Returns the latest full block in the canonical chain.
     *
     * @param cb - The callback. It is given two parameters `err` and the returned `block`
     */
    getLatestBlock(cb: any): void;
    /**
     * Adds many blocks to the blockchain.
     *
     * @param blocks - The blocks to be added to the blockchain
     * @param cb - The callback. It is given two parameters `err` and the last of the saved `blocks`
     */
    putBlocks(blocks: Array<any>, cb: any): void;
    /**
     * Adds a block to the blockchain.
     *
     * @param block - The block to be added to the blockchain
     * @param cb - The callback. It is given two parameters `err` and the saved `block`
     */
    putBlock(block: object, cb: any, isGenesis?: boolean): void;
    /**
     * Adds many headers to the blockchain.
     *
     * @param headers - The headers to be added to the blockchain
     * @param cb - The callback. It is given two parameters `err` and the last of the saved `headers`
     */
    putHeaders(headers: Array<any>, cb: any): void;
    /**
     * Adds a header to the blockchain.
     *
     * @param header - The header to be added to the blockchain
     * @param cb - The callback. It is given two parameters `err` and the saved `header`
     */
    putHeader(header: object, cb: any): void;
    /**
     * @hidden
     */
    _putBlockOrHeader(item: any, cb: any, isGenesis?: boolean): any;
    /**
     * Gets a block by its hash.
     *
     * @param blockTag - The block's hash or number
     * @param cb - The callback. It is given two parameters `err` and the found `block` (an instance of https://github.com/ethereumjs/ethereumjs-block) if any.
     */
    getBlock(blockTag: Buffer | number | BN, cb: any): void;
    /**
     * @hidden
     */
    _getBlock(blockTag: Buffer | number | BN, cb: any): void;
    /**
     * Looks up many blocks relative to blockId
     *
     * @param blockId - The block's hash or number
     * @param maxBlocks - Max number of blocks to return
     * @param skip - Number of blocks to skip apart
     * @param reverse - Fetch blocks in reverse
     * @param cb - The callback. It is given two parameters `err` and the found `blocks` if any.
     */
    getBlocks(blockId: Buffer | number, maxBlocks: number, skip: number, reverse: boolean, cb: any): void;
    /**
     * This method used to return block details by its hash. It's only here for backwards compatibility.
     *
     * @deprecated
     */
    getDetails(_: string, cb: any): void;
    /**
     * Given an ordered array, returns to the callback an array of hashes that are not in the blockchain yet.
     *
     * @param hashes - Ordered array of hashes
     * @param cb - The callback. It is given two parameters `err` and hashes found.
     */
    selectNeededHashes(hashes: Array<any>, cb: any): void;
    /**
     * @hidden
     */
    _saveHeadOps(): {
        type: string;
        key: string;
        keyEncoding: string;
        valueEncoding: string;
        value: any;
    }[];
    /**
     * @hidden
     */
    _saveHeads(cb: any): void;
    /**
     * Delete canonical number assignments for specified number and above
     *
     * @hidden
     */
    _deleteStaleAssignments(number: BN, headHash: Buffer, ops: any, cb: any): void;
    /**
     * Overwrites stale canonical number assignments.
     *
     * @hidden
     */
    _rebuildCanonical(header: any, ops: any, cb: any): any;
    /**
     * Deletes a block from the blockchain. All child blocks in the chain are deleted and any
     * encountered heads are set to the parent block.
     *
     * @param blockHash - The hash of the block to be deleted
     * @param cb - A callback.
     */
    delBlock(blockHash: Buffer, cb: any): void;
    /**
     * @hidden
     */
    _delBlock(blockHash: Buffer | typeof Block, cb: any): void;
    /**
     * @hidden
     */
    _delChild(hash: Buffer, number: BN, headHash: Buffer, ops: any, cb: any): any;
    /**
     * Iterates through blocks starting at the specified iterator head and calls the onBlock function
     * on each block. The current location of an iterator head can be retrieved using the `getHead()`
     * method.
     *
     * @param name - Name of the state root head
     * @param onBlock - Function called on each block with params (block, reorg, cb)
     * @param cb - A callback function
     */
    iterator(name: string, onBlock: any, cb: any): void;
    /**
     * @hidden
     */
    _iterator(name: string, func: any, cb: any): any;
    /**
     * Executes multiple db operations in a single batch call
     *
     * @hidden
     */
    _batchDbOps(dbOps: any, cb: any): void;
    /**
     * Performs a block hash to block number lookup
     *
     * @hidden
     */
    _hashToNumber(hash: Buffer, cb: any): void;
    /**
     * Performs a block number to block hash lookup
     *
     * @hidden
     */
    _numberToHash(number: BN, cb: any): void;
    /**
     * Helper function to lookup a block by either hash only or a hash and number
     *
     * @hidden
     */
    _lookupByHashNumber(hash: Buffer, number: BN, cb: any, next: any): void;
    /**
     * Gets a header by hash and number. Header can exist outside the canonical chain
     *
     * @hidden
     */
    _getHeader(hash: Buffer, number: any, cb?: any): void;
    /**
     * Gets a header by number. Header must be in the canonical chain
     *
     * @hidden
     */
    _getCanonicalHeader(number: BN, cb: any): void;
    /**
     * Gets total difficulty for a block specified by hash and number
     *
     * @hidden
     */
    _getTd(hash: any, number: any, cb?: any): void;
    /**
     * @hidden
     */
    _lockUnlock(fn: any, cb: any): void;
}
export {};

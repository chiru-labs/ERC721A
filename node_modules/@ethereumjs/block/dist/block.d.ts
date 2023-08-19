/// <reference types="node" />
/// <reference types="bn.js" />
import { BaseTrie as Trie } from 'merkle-patricia-tree';
import { BN } from 'ethereumjs-util';
import Common from '@ethereumjs/common';
import { TypedTransaction } from '@ethereumjs/tx';
import { BlockHeader } from './header';
import { BlockData, BlockOptions, JsonBlock, BlockBuffer, Blockchain } from './types';
/**
 * An object that represents the block.
 */
export declare class Block {
    readonly header: BlockHeader;
    readonly transactions: TypedTransaction[];
    readonly uncleHeaders: BlockHeader[];
    readonly txTrie: Trie;
    readonly _common: Common;
    /**
     * Static constructor to create a block from a block data dictionary
     *
     * @param blockData
     * @param opts
     */
    static fromBlockData(blockData?: BlockData, opts?: BlockOptions): Block;
    /**
     * Static constructor to create a block from a RLP-serialized block
     *
     * @param serialized
     * @param opts
     */
    static fromRLPSerializedBlock(serialized: Buffer, opts?: BlockOptions): Block;
    /**
     * Static constructor to create a block from an array of Buffer values
     *
     * @param values
     * @param opts
     */
    static fromValuesArray(values: BlockBuffer, opts?: BlockOptions): Block;
    /**
     * Alias for {@link Block.fromBlockData} with {@link BlockOptions.initWithGenesisHeader} set to true.
     */
    static genesis(blockData?: BlockData, opts?: BlockOptions): Block;
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     * Use the static factory methods to assist in creating a Block object from varying data types and options.
     */
    constructor(header?: BlockHeader, transactions?: TypedTransaction[], uncleHeaders?: BlockHeader[], opts?: BlockOptions);
    /**
     * Returns a Buffer Array of the raw Buffers of this block, in order.
     */
    raw(): BlockBuffer;
    /**
     * Produces a hash the RLP of the block.
     */
    hash(): Buffer;
    /**
     * Determines if this block is the genesis block.
     */
    isGenesis(): boolean;
    /**
     * Returns the rlp encoding of the block.
     */
    serialize(): Buffer;
    /**
     * Generates transaction trie for validation.
     */
    genTxTrie(): Promise<void>;
    /**
     * Validates the transaction trie by generating a trie
     * and do a check on the root hash.
     */
    validateTransactionsTrie(): Promise<boolean>;
    /**
     * Validates transaction signatures and minimum gas requirements.
     *
     * @param stringError - If `true`, a string with the indices of the invalid txs is returned.
     */
    validateTransactions(): boolean;
    validateTransactions(stringError: false): boolean;
    validateTransactions(stringError: true): string[];
    /**
     * Performs the following consistency checks on the block:
     *
     * - Value checks on the header fields
     * - Signature and gasLimit validation for included txs
     * - Validation of the tx trie
     * - Consistency checks and header validation of included uncles
     *
     * Throws if invalid.
     *
     * @param blockchain - validate against an @ethereumjs/blockchain
     * @param onlyHeader - if should only validate the header (skips validating txTrie and unclesHash) (default: false)
     */
    validate(blockchain: Blockchain, onlyHeader?: boolean): Promise<void>;
    /**
     * Validates the block data, throwing if invalid.
     * This can be checked on the Block itself without needing access to any parent block
     * It checks:
     * - All transactions are valid
     * - The transactions trie is valid
     * - The uncle hash is valid
     * @param onlyHeader if only passed the header, skip validating txTrie and unclesHash (default: false)
     */
    validateData(onlyHeader?: boolean): Promise<void>;
    /**
     * Validates the uncle's hash.
     */
    validateUnclesHash(): boolean;
    /**
     * Consistency checks and header validation for uncles included,
     * in the block, if any.
     *
     * Throws if invalid.
     *
     * The rules of uncles are the following:
     * Uncle Header is a valid header.
     * Uncle Header is an orphan, i.e. it is not one of the headers of the canonical chain.
     * Uncle Header has a parentHash which points to the canonical chain. This parentHash is within the last 7 blocks.
     * Uncle Header is not already included as uncle in another block.
     * Header has at most 2 uncles.
     * Header does not count an uncle twice.
     *
     * @param blockchain - additionally validate against an @ethereumjs/blockchain instance
     */
    validateUncles(blockchain: Blockchain): Promise<void>;
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlock - the parent of this `Block`
     */
    canonicalDifficulty(parentBlock: Block): BN;
    /**
     * Checks that the block's `difficulty` matches the canonical difficulty.
     *
     * @param parentBlock - the parent of this `Block`
     */
    validateDifficulty(parentBlock: Block): boolean;
    /**
     * Validates if the block gasLimit remains in the
     * boundaries set by the protocol.
     *
     * @param parentBlock - the parent of this `Block`
     */
    validateGasLimit(parentBlock: Block): boolean;
    /**
     * Returns the block in JSON format.
     */
    toJSON(): JsonBlock;
    /**
     * The following rules are checked in this method:
     * Uncle Header is a valid header.
     * Uncle Header is an orphan, i.e. it is not one of the headers of the canonical chain.
     * Uncle Header has a parentHash which points to the canonical chain. This parentHash is within the last 7 blocks.
     * Uncle Header is not already included as uncle in another block.
     * @param uncleHeaders - list of uncleHeaders
     * @param blockchain - pointer to the blockchain
     */
    private _validateUncleHeaders;
    private _getBlockByHash;
    /**
     * Return a compact error string representation of the object
     */
    errorStr(): string;
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    protected _errorMsg(msg: string): string;
}

/// <reference types="node" />
/// <reference types="bn.js" />
import Common from '@ethereumjs/common';
import { Address, BN } from 'ethereumjs-util';
import { Blockchain, BlockHeaderBuffer, BlockOptions, HeaderData, JsonHeader } from './types';
/**
 * An object that represents the block header.
 */
export declare class BlockHeader {
    readonly parentHash: Buffer;
    readonly uncleHash: Buffer;
    readonly coinbase: Address;
    readonly stateRoot: Buffer;
    readonly transactionsTrie: Buffer;
    readonly receiptTrie: Buffer;
    readonly logsBloom: Buffer;
    readonly difficulty: BN;
    readonly number: BN;
    readonly gasLimit: BN;
    readonly gasUsed: BN;
    readonly timestamp: BN;
    readonly extraData: Buffer;
    readonly mixHash: Buffer;
    readonly nonce: Buffer;
    readonly baseFeePerGas?: BN;
    readonly _common: Common;
    private cache;
    /**
     * Backwards compatible alias for {@link BlockHeader.logsBloom}
     * (planned to be removed in next major release)
     * @deprecated
     */
    get bloom(): Buffer;
    /**
     * Static constructor to create a block header from a header data dictionary
     *
     * @param headerData
     * @param opts
     */
    static fromHeaderData(headerData?: HeaderData, opts?: BlockOptions): BlockHeader;
    /**
     * Static constructor to create a block header from a RLP-serialized header
     *
     * @param headerData
     * @param opts
     */
    static fromRLPSerializedHeader(serialized: Buffer, opts?: BlockOptions): BlockHeader;
    /**
     * Static constructor to create a block header from an array of Buffer values
     *
     * @param headerData
     * @param opts
     */
    static fromValuesArray(values: BlockHeaderBuffer, opts?: BlockOptions): BlockHeader;
    /**
     * Alias for {@link BlockHeader.fromHeaderData} with {@link BlockOptions.initWithGenesisHeader} set to true.
     */
    static genesis(headerData?: HeaderData, opts?: BlockOptions): BlockHeader;
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * @deprecated - Use the public static factory methods to assist in creating a Header object from
     * varying data types. For a default empty header, use {@link BlockHeader.fromHeaderData}.
     *
     */
    constructor(parentHash: Buffer, uncleHash: Buffer, coinbase: Address, stateRoot: Buffer, transactionsTrie: Buffer, receiptTrie: Buffer, logsBloom: Buffer, difficulty: BN, number: BN, gasLimit: BN, gasUsed: BN, timestamp: BN, extraData: Buffer, mixHash: Buffer, nonce: Buffer, options?: BlockOptions, baseFeePerGas?: BN);
    /**
     * Validates correct buffer lengths, throws if invalid.
     */
    _validateHeaderFields(): void;
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    canonicalDifficulty(parentBlockHeader: BlockHeader): BN;
    /**
     * Checks that the block's `difficulty` matches the canonical difficulty.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    validateDifficulty(parentBlockHeader: BlockHeader): boolean;
    /**
     * For poa, validates `difficulty` is correctly identified as INTURN or NOTURN.
     * Returns false if invalid.
     */
    validateCliqueDifficulty(blockchain: Blockchain): boolean;
    /**
     * Validates if the block gasLimit remains in the
     * boundaries set by the protocol.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    validateGasLimit(parentBlockHeader: BlockHeader): boolean;
    /**
     * Validates the block header, throwing if invalid. It is being validated against the reported `parentHash`.
     * It verifies the current block against the `parentHash`:
     * - The `parentHash` is part of the blockchain (it is a valid header)
     * - Current block number is parent block number + 1
     * - Current block has a strictly higher timestamp
     * - Additional PoW checks ->
     *   - Current block has valid difficulty and gas limit
     *   - In case that the header is an uncle header, it should not be too old or young in the chain.
     * - Additional PoA clique checks ->
     *   - Various extraData checks
     *   - Checks on coinbase and mixHash
     *   - Current block has a timestamp diff greater or equal to PERIOD
     *   - Current block has difficulty correctly marked as INTURN or NOTURN
     * @param blockchain - validate against an @ethereumjs/blockchain
     * @param height - If this is an uncle header, this is the height of the block that is including it
     */
    validate(blockchain: Blockchain, height?: BN): Promise<void>;
    /**
     * Calculates the base fee for a potential next block
     */
    calcNextBaseFee(): BN;
    /**
     * Returns a Buffer Array of the raw Buffers in this header, in order.
     */
    raw(): BlockHeaderBuffer;
    /**
     * Returns the hash of the block header.
     */
    hash(): Buffer;
    /**
     * Checks if the block header is a genesis header.
     */
    isGenesis(): boolean;
    private _requireClique;
    /**
     * PoA clique signature hash without the seal.
     */
    cliqueSigHash(): Buffer;
    /**
     * Checks if the block header is an epoch transition
     * header (only clique PoA, throws otherwise)
     */
    cliqueIsEpochTransition(): boolean;
    /**
     * Returns extra vanity data
     * (only clique PoA, throws otherwise)
     */
    cliqueExtraVanity(): Buffer;
    /**
     * Returns extra seal data
     * (only clique PoA, throws otherwise)
     */
    cliqueExtraSeal(): Buffer;
    /**
     * Seal block with the provided signer.
     * Returns the final extraData field to be assigned to `this.extraData`.
     * @hidden
     */
    private cliqueSealBlock;
    /**
     * Returns a list of signers
     * (only clique PoA, throws otherwise)
     *
     * This function throws if not called on an epoch
     * transition block and should therefore be used
     * in conjunction with {@link BlockHeader.cliqueIsEpochTransition}
     */
    cliqueEpochTransitionSigners(): Address[];
    /**
     * Verifies the signature of the block (last 65 bytes of extraData field)
     * (only clique PoA, throws otherwise)
     *
     *  Method throws if signature is invalid
     */
    cliqueVerifySignature(signerList: Address[]): boolean;
    /**
     * Returns the signer address
     */
    cliqueSigner(): Address;
    /**
     * Returns the rlp encoding of the block header.
     */
    serialize(): Buffer;
    /**
     * Returns the block header in JSON format.
     */
    toJSON(): JsonHeader;
    private _getHardfork;
    private _getHeaderByHash;
    /**
     * Validates extra data is DAO_ExtraData for DAO_ForceExtraDataRange blocks after DAO
     * activation block (see: https://blog.slock.it/hard-fork-specification-24b889e70703)
     */
    private _validateDAOExtraData;
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

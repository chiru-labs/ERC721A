/// <reference types="bn.js" />
/// <reference types="node" />
import { BN } from 'ethereumjs-util';
import { TxOptions, TxData, JsonTx, TxValuesArray } from './types';
import { BaseTransaction } from './baseTransaction';
import Common from '@ethereumjs/common';
/**
 * An Ethereum non-typed (legacy) transaction
 */
export default class Transaction extends BaseTransaction<Transaction> {
    readonly gasPrice: BN;
    readonly common: Common;
    /**
     * Instantiate a transaction from a data dictionary.
     *
     * Format: { nonce, gasPrice, gasLimit, to, value, data, v, r, s }
     *
     * Notes:
     * - All parameters are optional and have some basic default values
     */
    static fromTxData(txData: TxData, opts?: TxOptions): Transaction;
    /**
     * Instantiate a transaction from the serialized tx.
     *
     * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
     */
    static fromSerializedTx(serialized: Buffer, opts?: TxOptions): Transaction;
    /**
     * Instantiate a transaction from the serialized tx.
     * (alias of {@link Transaction.fromSerializedTx})
     *
     * @deprecated this constructor alias is deprecated and will be removed
     * in favor of the {@link Transaction.fromSerializedTx} constructor
     */
    static fromRlpSerializedTx(serialized: Buffer, opts?: TxOptions): Transaction;
    /**
     * Create a transaction from a values array.
     *
     * Format: `[nonce, gasPrice, gasLimit, to, value, data, v, r, s]`
     */
    static fromValuesArray(values: TxValuesArray, opts?: TxOptions): Transaction;
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * It is not recommended to use this constructor directly. Instead use
     * the static factory methods to assist in creating a Transaction object from
     * varying data types.
     */
    constructor(txData: TxData, opts?: TxOptions);
    /**
     * Returns a Buffer Array of the raw Buffers of the legacy transaction, in order.
     *
     * Format: `[nonce, gasPrice, gasLimit, to, value, data, v, r, s]`
     *
     * For legacy txs this is also the correct format to add transactions
     * to a block with {@link Block.fromValuesArray} (use the `serialize()` method
     * for typed txs).
     *
     * For an unsigned tx this method returns the empty Buffer values
     * for the signature parameters `v`, `r` and `s`. For an EIP-155 compliant
     * representation have a look at {@link Transaction.getMessageToSign}.
     */
    raw(): TxValuesArray;
    /**
     * Returns the serialized encoding of the legacy transaction.
     *
     * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
     *
     * For an unsigned tx this method uses the empty Buffer values for the
     * signature parameters `v`, `r` and `s` for encoding. For an EIP-155 compliant
     * representation for external signing use {@link Transaction.getMessageToSign}.
     */
    serialize(): Buffer;
    private _getMessageToSign;
    /**
     * Returns the unsigned tx (hashed or raw), which can be used
     * to sign the transaction (e.g. for sending to a hardware wallet).
     *
     * Note: the raw message message format for the legacy tx is not RLP encoded
     * and you might need to do yourself with:
     *
     * ```javascript
     * import { rlp } from 'ethereumjs-util'
     * const message = tx.getMessageToSign(false)
     * const serializedMessage = rlp.encode(message) // use this for the HW wallet input
     * ```
     *
     * @param hashMessage - Return hashed message if set to true (default: true)
     */
    getMessageToSign(hashMessage: false): Buffer[];
    getMessageToSign(hashMessage?: true): Buffer;
    /**
     * The amount of gas paid for the data in this tx
     */
    getDataFee(): BN;
    /**
     * The up front amount that an account must have for this transaction to be valid
     */
    getUpfrontCost(): BN;
    /**
     * Computes a sha3-256 hash of the serialized tx.
     *
     * This method can only be used for signed txs (it throws otherwise).
     * Use {@link Transaction.getMessageToSign} to get a tx hash for the purpose of signing.
     */
    hash(): Buffer;
    /**
     * Computes a sha3-256 hash which can be used to verify the signature
     */
    getMessageToVerifySignature(): Buffer;
    /**
     * Returns the public key of the sender
     */
    getSenderPublicKey(): Buffer;
    /**
     * Process the v, r, s values from the `sign` method of the base transaction.
     */
    protected _processSignature(v: number, r: Buffer, s: Buffer): Transaction;
    /**
     * Returns an object with the JSON representation of the transaction.
     */
    toJSON(): JsonTx;
    /**
     * Validates tx's `v` value
     */
    private _validateTxV;
    /**
     * @deprecated if you have called this internal method please use `tx.supports(Capabilities.EIP155ReplayProtection)` instead
     */
    private _unsignedTxImplementsEIP155;
    /**
     * @deprecated if you have called this internal method please use `tx.supports(Capabilities.EIP155ReplayProtection)` instead
     */
    private _signedTxImplementsEIP155;
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

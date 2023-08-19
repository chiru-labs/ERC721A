/// <reference types="bn.js" />
import { BN } from 'ethereumjs-util';
import { Block } from '@ethereumjs/block';
import { AccessList, TypedTransaction } from '@ethereumjs/tx';
import VM from './index';
import Bloom from './bloom';
import { EVMResult } from './evm/evm';
import type { TxReceipt } from './types';
/**
 * Options for the `runTx` method.
 */
export interface RunTxOpts {
    /**
     * The `@ethereumjs/block` the `tx` belongs to.
     * If omitted, a default blank block will be used.
     */
    block?: Block;
    /**
     * An `@ethereumjs/tx` to run
     */
    tx: TypedTransaction;
    /**
     * If true, skips the nonce check
     */
    skipNonce?: boolean;
    /**
     * If true, skips the balance check
     */
    skipBalance?: boolean;
    /**
     * If true, skips the validation of the tx's gas limit
     * agains the block's gas limit.
     */
    skipBlockGasLimitValidation?: boolean;
    /**
     * If true, adds a generated EIP-2930 access list
     * to the `RunTxResult` returned.
     *
     * Option works with all tx types. EIP-2929 needs to
     * be activated (included in `berlin` HF).
     *
     * Note: if this option is used with a custom {@link StateManager} implementation
     * {@link StateManager.generateAccessList} must be implemented.
     */
    reportAccessList?: boolean;
    /**
     * To obtain an accurate tx receipt input the block gas used up until this tx.
     */
    blockGasUsed?: BN;
}
/**
 * Execution result of a transaction
 */
export interface RunTxResult extends EVMResult {
    /**
     * Bloom filter resulted from transaction
     */
    bloom: Bloom;
    /**
     * The amount of ether used by this transaction
     */
    amountSpent: BN;
    /**
     * The tx receipt
     */
    receipt: TxReceipt;
    /**
     * The amount of gas as that was refunded during the transaction (i.e. `gasUsed = totalGasConsumed - gasRefund`)
     */
    gasRefund?: BN;
    /**
     * EIP-2930 access list generated for the tx (see `reportAccessList` option)
     */
    accessList?: AccessList;
}
export interface AfterTxEvent extends RunTxResult {
    /**
     * The transaction which just got finished
     */
    transaction: TypedTransaction;
}
/**
 * @ignore
 */
export default function runTx(this: VM, opts: RunTxOpts): Promise<RunTxResult>;
/**
 * Returns the tx receipt.
 * @param this The vm instance
 * @param tx The transaction
 * @param txResult The tx result
 * @param cumulativeGasUsed The gas used in the block including this tx
 */
export declare function generateTxReceipt(this: VM, tx: TypedTransaction, txResult: RunTxResult, cumulativeGasUsed: BN): Promise<TxReceipt>;

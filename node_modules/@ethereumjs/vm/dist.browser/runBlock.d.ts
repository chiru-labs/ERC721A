/// <reference types="node" />
/// <reference types="bn.js" />
import { Account, Address, BN } from 'ethereumjs-util';
import { Block } from '@ethereumjs/block';
import VM from './index';
import { StateManager } from './state';
import { TypedTransaction } from '@ethereumjs/tx';
import type { RunTxResult } from './runTx';
import type { TxReceipt } from './types';
import { PreByzantiumTxReceipt, PostByzantiumTxReceipt, EIP2930Receipt } from './types';
export { PreByzantiumTxReceipt, PostByzantiumTxReceipt, EIP2930Receipt };
/**
 * Options for running a block.
 */
export interface RunBlockOpts {
    /**
     * The @ethereumjs/block to process
     */
    block: Block;
    /**
     * Root of the state trie
     */
    root?: Buffer;
    /**
     * Whether to generate the stateRoot and other related fields.
     * If `true`, `runBlock` will set the fields `stateRoot`, `receiptsTrie`, `gasUsed`, and `bloom` (logs bloom) after running the block.
     * If `false`, `runBlock` throws if any fields do not match.
     * Defaults to `false`.
     */
    generate?: boolean;
    /**
     * If true, will skip "Block validation":
     * Block validation validates the header (with respect to the blockchain),
     * the transactions, the transaction trie and the uncle hash.
     */
    skipBlockValidation?: boolean;
    /**
     * If true, skips the nonce check
     */
    skipNonce?: boolean;
    /**
     * If true, skips the balance check
     */
    skipBalance?: boolean;
}
/**
 * Result of {@link runBlock}
 */
export interface RunBlockResult {
    /**
     * Receipts generated for transactions in the block
     */
    receipts: TxReceipt[];
    /**
     * Results of executing the transactions in the block
     */
    results: RunTxResult[];
    /**
     * The stateRoot after executing the block
     */
    stateRoot: Buffer;
    /**
     * The gas used after executing the block
     */
    gasUsed: BN;
    /**
     * The bloom filter of the LOGs (events) after executing the block
     */
    logsBloom: Buffer;
    /**
     * The receipt root after executing the block
     */
    receiptRoot: Buffer;
}
export interface AfterBlockEvent extends RunBlockResult {
    block: Block;
}
/**
 * @ignore
 */
export default function runBlock(this: VM, opts: RunBlockOpts): Promise<RunBlockResult>;
export declare function calculateMinerReward(minerReward: BN, ommersNum: number): BN;
export declare function rewardAccount(state: StateManager, address: Address, reward: BN): Promise<Account>;
/**
 * Returns the encoded tx receipt.
 */
export declare function encodeReceipt(tx: TypedTransaction, receipt: TxReceipt): Buffer;
/**
 * Generates the tx receipt and returns { txReceipt, encodedReceipt, receiptLog }
 * @deprecated Please use the new `generateTxReceipt` located in runTx.
 */
export declare function generateTxReceipt(this: VM, tx: TypedTransaction, txRes: RunTxResult, blockGasUsed: BN): Promise<{
    txReceipt: PreByzantiumTxReceipt | PostByzantiumTxReceipt;
    encodedReceipt: Buffer;
    receiptLog: string;
}>;

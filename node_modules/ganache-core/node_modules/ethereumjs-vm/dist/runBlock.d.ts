/// <reference types="node" />
import VM from './index';
import { RunTxResult } from './runTx';
/**
 * Options for running a block.
 */
export interface RunBlockOpts {
    /**
     * The [`Block`](https://github.com/ethereumjs/ethereumjs-block) to process
     */
    block: any;
    /**
     * Root of the state trie
     */
    root?: Buffer;
    /**
     * Whether to generate the stateRoot. If false `runBlock` will check the
     * stateRoot of the block against the Trie
     */
    generate?: boolean;
    /**
     * If true, will skip block validation
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
 * Result of [[runBlock]]
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
}
/**
 * Receipt generated for a transaction
 */
export interface TxReceipt {
    /**
     * Status of transaction, `1` if successful, `0` if an exception occured
     */
    status: 0 | 1;
    /**
     * Gas used
     */
    gasUsed: Buffer;
    /**
     * Bloom bitvector
     */
    bitvector: Buffer;
    /**
     * Logs emitted
     */
    logs: any[];
}
/**
 * @ignore
 */
export default function runBlock(this: VM, opts: RunBlockOpts): Promise<RunBlockResult>;

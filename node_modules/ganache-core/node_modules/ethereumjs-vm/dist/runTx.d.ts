import BN = require('bn.js');
import { Transaction } from 'ethereumjs-tx';
import VM from './index';
import Bloom from './bloom';
import { EVMResult } from './evm/evm';
/**
 * Options for the `runTx` method.
 */
export interface RunTxOpts {
    /**
     * The block to which the `tx` belongs
     */
    block?: any;
    /**
     * A [`Transaction`](https://github.com/ethereum/ethereumjs-tx) to run
     */
    tx: Transaction;
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
     * The amount of gas as that was refunded during the transaction (i.e. `gasUsed = totalGasConsumed - gasRefund`)
     */
    gasRefund?: BN;
}
/**
 * @ignore
 */
export default function runTx(this: VM, opts: RunTxOpts): Promise<RunTxResult>;

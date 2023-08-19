import { SecureTrie as Trie } from 'merkle-patricia-tree';
import { BNLike } from 'ethereumjs-util';
import Blockchain from '@ethereumjs/blockchain';
import Common from '@ethereumjs/common';
import { StateManager } from './state/index';
import { RunCodeOpts } from './runCode';
import { RunCallOpts } from './runCall';
import { RunTxOpts, RunTxResult } from './runTx';
import { RunBlockOpts, RunBlockResult } from './runBlock';
import { BuildBlockOpts, BlockBuilder } from './buildBlock';
import { EVMResult, ExecResult } from './evm/evm';
import { OpcodeList } from './evm/opcodes';
declare const AsyncEventEmitter: any;
/**
 * Options for instantiating a {@link VM}.
 */
export interface VMOpts {
    /**
     * Use a {@link Common} instance
     * if you want to change the chain setup.
     *
     * ### Possible Values
     *
     * - `chain`: all chains supported by `Common` or a custom chain
     * - `hardfork`: `mainnet` hardforks up to the `MuirGlacier` hardfork
     * - `eips`: `2537` (usage e.g. `eips: [ 2537, ]`)
     *
     * ### Supported EIPs
     *
     * - [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) - Fee Market
     * - [EIP-2315](https://eips.ethereum.org/EIPS/eip-2315) - VM simple subroutines
     * - [EIP-2537](https://eips.ethereum.org/EIPS/eip-2537) (`experimental`) - BLS12-381 precompiles
     * - [EIP-2565](https://eips.ethereum.org/EIPS/eip-2565) - ModExp Gas Cost
     * - [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718) - Typed Transactions
     * - [EIP-2929](https://eips.ethereum.org/EIPS/eip-2929) - Gas cost increases for state access opcodes
     * - [EIP-2930](https://eips.ethereum.org/EIPS/eip-2930) - Access List Transaction Type
     * - [EIP-3198](https://eips.ethereum.org/EIPS/eip-3198) - BASEFEE opcode
     * - [EIP-3529](https://eips.ethereum.org/EIPS/eip-3529) - Reduction in refunds
     * - [EIP-3541](https://eips.ethereum.org/EIPS/eip-3541) - Reject new contracts starting with the 0xEF byte
     *
     * *Annotations:*
     *
     * - `experimental`: behaviour can change on patch versions
     *
     * ### Default Setup
     *
     * Default setup if no `Common` instance is provided:
     *
     * - `chain`: `mainnet`
     * - `hardfork`: `istanbul`
     * - `eips`: `[]`
     */
    common?: Common;
    /**
     * A {@link StateManager} instance to use as the state store (Beta API)
     */
    stateManager?: StateManager;
    /**
     * A {@link SecureTrie} instance for the state tree (ignored if stateManager is passed)
     * @deprecated - will be removed in next major version release
     */
    state?: Trie;
    /**
     * A {@link Blockchain} object for storing/retrieving blocks
     */
    blockchain?: Blockchain;
    /**
     * If true, create entries in the state tree for the precompiled contracts, saving some gas the
     * first time each of them is called.
     *
     * If this parameter is false, the first call to each of them has to pay an extra 25000 gas
     * for creating the account.
     *
     * Setting this to true has the effect of precompiled contracts' gas costs matching mainnet's from
     * the very first call, which is intended for testing networks.
     *
     * Default: `false`
     */
    activatePrecompiles?: boolean;
    /**
     * Allows unlimited contract sizes while debugging. By setting this to `true`, the check for
     * contract size limit of 24KB (see [EIP-170](https://git.io/vxZkK)) is bypassed.
     *
     * Default: `false` [ONLY set to `true` during debugging]
     */
    allowUnlimitedContractSize?: boolean;
    /**
     * Select hardfork based upon block number. This automatically switches to the right hard fork based upon the block number.
     *
     * Default: `false`
     */
    hardforkByBlockNumber?: boolean;
    /**
     * Select the HF by total difficulty (Merge HF)
     *
     * This option is a superset of `hardforkByBlockNumber` (so only use one of both options)
     * and determines the HF by both the block number and the TD.
     *
     * Since the TD is only a threshold the block number will in doubt take precedence (imagine
     * e.g. both Merge and Shanghai HF blocks set and the block number from the block provided
     * pointing to a Shanghai block: this will lead to set the HF as Shanghai and not the Merge).
     */
    hardforkByTD?: BNLike;
}
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
export default class VM extends AsyncEventEmitter {
    /**
     * The StateManager used by the VM
     */
    readonly stateManager: StateManager;
    /**
     * The blockchain the VM operates on
     */
    readonly blockchain: Blockchain;
    readonly _common: Common;
    protected readonly _opts: VMOpts;
    protected _isInitialized: boolean;
    protected readonly _allowUnlimitedContractSize: boolean;
    protected _opcodes: OpcodeList;
    protected readonly _hardforkByBlockNumber: boolean;
    protected readonly _hardforkByTD?: BNLike;
    /**
     * Cached emit() function, not for public usage
     * set to public due to implementation internals
     * @hidden
     */
    readonly _emit: (topic: string, data: any) => Promise<void>;
    /**
     * Pointer to the mcl package, not for public usage
     * set to public due to implementation internals
     * @hidden
     */
    readonly _mcl: any;
    /**
     * VM is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    protected readonly DEBUG: boolean;
    /**
     * VM async constructor. Creates engine instance and initializes it.
     *
     * @param opts VM engine constructor options
     */
    static create(opts?: VMOpts): Promise<VM>;
    /**
     * Instantiates a new {@link VM} Object.
     * @param opts
     */
    constructor(opts?: VMOpts);
    init(): Promise<void>;
    /**
     * Processes blocks and adds them to the blockchain.
     *
     * This method modifies the state.
     *
     * @param blockchain -  A {@link Blockchain} object to process
     */
    runBlockchain(blockchain?: Blockchain, maxBlocks?: number): Promise<void | number>;
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     *
     * This method modifies the state. If `generate` is `true`, the state modifications will be
     * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
     * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
     *
     * @param {RunBlockOpts} opts - Default values for options:
     *  - `generate`: false
     */
    runBlock(opts: RunBlockOpts): Promise<RunBlockResult>;
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     *
     * @param {RunTxOpts} opts
     */
    runTx(opts: RunTxOpts): Promise<RunTxResult>;
    /**
     * runs a call (or create) operation.
     *
     * This method modifies the state.
     *
     * @param {RunCallOpts} opts
     */
    runCall(opts: RunCallOpts): Promise<EVMResult>;
    /**
     * Runs EVM code.
     *
     * This method modifies the state.
     *
     * @param {RunCodeOpts} opts
     */
    runCode(opts: RunCodeOpts): Promise<ExecResult>;
    /**
     * Build a block on top of the current state
     * by adding one transaction at a time.
     *
     * Creates a checkpoint on the StateManager and modifies the state
     * as transactions are run. The checkpoint is committed on {@link BlockBuilder.build}
     * or discarded with {@link BlockBuilder.revert}.
     *
     * @param {BuildBlockOpts} opts
     * @returns An instance of {@link BlockBuilder} with methods:
     * - {@link BlockBuilder.addTransaction}
     * - {@link BlockBuilder.build}
     * - {@link BlockBuilder.revert}
     */
    buildBlock(opts: BuildBlockOpts): Promise<BlockBuilder>;
    /**
     * Returns a list with the currently activated opcodes
     * available for VM execution
     */
    getActiveOpcodes(): OpcodeList;
    /**
     * Returns a copy of the {@link VM} instance.
     */
    copy(): VM;
    /**
     * Return a compact error string representation of the object
     */
    errorStr(): string;
}
export {};

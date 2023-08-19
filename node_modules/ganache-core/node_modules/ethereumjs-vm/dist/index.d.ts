import Blockchain from 'ethereumjs-blockchain';
import Common from 'ethereumjs-common';
import { StateManager } from './state';
import { RunCodeOpts } from './runCode';
import { RunCallOpts } from './runCall';
import { RunTxOpts, RunTxResult } from './runTx';
import { RunBlockOpts, RunBlockResult } from './runBlock';
import { EVMResult, ExecResult } from './evm/evm';
import { OpcodeList } from './evm/opcodes';
import PStateManager from './state/promisified';
declare const AsyncEventEmitter: any;
/**
 * Options for instantiating a [[VM]].
 */
export interface VMOpts {
    /**
     * The chain the VM operates on
     */
    chain?: string;
    /**
     * Hardfork rules to be used
     */
    hardfork?: string;
    /**
     * A [[StateManager]] instance to use as the state store (Beta API)
     */
    stateManager?: StateManager;
    /**
     * A [merkle-patricia-tree](https://github.com/ethereumjs/merkle-patricia-tree) instance for the state tree (ignored if stateManager is passed)
     * @deprecated
     */
    state?: any;
    /**
     * A [blockchain](https://github.com/ethereumjs/ethereumjs-blockchain) object for storing/retrieving blocks
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
     */
    activatePrecompiles?: boolean;
    /**
     * Allows unlimited contract sizes while debugging. By setting this to `true`, the check for contract size limit of 24KB (see [EIP-170](https://git.io/vxZkK)) is bypassed
     */
    allowUnlimitedContractSize?: boolean;
    common?: Common;
}
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
export default class VM extends AsyncEventEmitter {
    opts: VMOpts;
    _common: Common;
    stateManager: StateManager;
    blockchain: Blockchain;
    allowUnlimitedContractSize: boolean;
    _opcodes: OpcodeList;
    readonly _emit: (topic: string, data: any) => Promise<void>;
    readonly pStateManager: PStateManager;
    /**
     * Instantiates a new [[VM]] Object.
     * @param opts - Default values for the options are:
     *  - `chain`: 'mainnet'
     *  - `hardfork`: 'petersburg' [supported: 'byzantium', 'constantinople', 'petersburg', 'istanbul' (DRAFT) (will throw on unsupported)]
     *  - `activatePrecompiles`: false
     *  - `allowUnlimitedContractSize`: false [ONLY set to `true` during debugging]
     */
    constructor(opts?: VMOpts);
    /**
     * Processes blocks and adds them to the blockchain.
     *
     * This method modifies the state.
     *
     * @param blockchain -  A [blockchain](https://github.com/ethereum/ethereumjs-blockchain) object to process
     */
    runBlockchain(blockchain: any): Promise<void>;
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     *
     * This method modifies the state. If `generate` is `true`, the state modifications will be
     * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
     * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
     *
     * @param opts - Default values for options:
     *  - `generate`: false
     */
    runBlock(opts: RunBlockOpts): Promise<RunBlockResult>;
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     */
    runTx(opts: RunTxOpts): Promise<RunTxResult>;
    /**
     * runs a call (or create) operation.
     *
     * This method modifies the state.
     */
    runCall(opts: RunCallOpts): Promise<EVMResult>;
    /**
     * Runs EVM code.
     *
     * This method modifies the state.
     */
    runCode(opts: RunCodeOpts): Promise<ExecResult>;
    /**
     * Returns a copy of the [[VM]] instance.
     */
    copy(): VM;
}
export {};

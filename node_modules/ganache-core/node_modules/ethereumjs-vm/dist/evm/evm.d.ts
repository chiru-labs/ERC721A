/// <reference types="node" />
import BN = require('bn.js');
import Account from 'ethereumjs-account';
import { VmError } from '../exceptions';
import PStateManager from '../state/promisified';
import { PrecompileFunc } from './precompiles';
import TxContext from './txContext';
import Message from './message';
import { InterpreterOpts, RunState } from './interpreter';
/**
 * Result of executing a message via the [[EVM]].
 */
export interface EVMResult {
    /**
     * Amount of gas used by the transaction
     */
    gasUsed: BN;
    /**
     * Address of created account durint transaction, if any
     */
    createdAddress?: Buffer;
    /**
     * Contains the results from running the code, if any, as described in [[runCode]]
     */
    execResult: ExecResult;
}
/**
 * Result of executing a call via the [[EVM]].
 */
export interface ExecResult {
    runState?: RunState;
    /**
     * Description of the exception, if any occured
     */
    exceptionError?: VmError;
    /**
     * Amount of gas left
     */
    gas?: BN;
    /**
     * Amount of gas the code used to run
     */
    gasUsed: BN;
    /**
     * Return value from the contract
     */
    returnValue: Buffer;
    /**
     * Array of logs that the contract emitted
     */
    logs?: any[];
    /**
     * A map from the accounts that have self-destructed to the addresses to send their funds to
     */
    selfdestruct?: {
        [k: string]: Buffer;
    };
    /**
     * Total amount of gas to be refunded from all nested calls.
     */
    gasRefund?: BN;
}
export interface NewContractEvent {
    address: Buffer;
    code: Buffer;
}
export declare function OOGResult(gasLimit: BN): ExecResult;
/**
 * EVM is responsible for executing an EVM message fully
 * (including any nested calls and creates), processing the results
 * and storing them to state (or discarding changes in case of exceptions).
 * @ignore
 */
export default class EVM {
    _vm: any;
    _state: PStateManager;
    _tx: TxContext;
    _block: any;
    /**
     * Amount of gas to refund from deleting storage values
     */
    _refund: BN;
    constructor(vm: any, txContext: TxContext, block: any);
    /**
     * Executes an EVM message, determining whether it's a call or create
     * based on the `to` address. It checkpoints the state and reverts changes
     * if an exception happens during the message execution.
     */
    executeMessage(message: Message): Promise<EVMResult>;
    _executeCall(message: Message): Promise<EVMResult>;
    _executeCreate(message: Message): Promise<EVMResult>;
    /**
     * Starts the actual bytecode processing for a CALL or CREATE, providing
     * it with the [[EEI]].
     */
    runInterpreter(message: Message, opts?: InterpreterOpts): Promise<ExecResult>;
    /**
     * Returns code for precompile at the given address, or undefined
     * if no such precompile exists.
     */
    getPrecompile(address: Buffer): PrecompileFunc;
    /**
     * Executes a precompiled contract with given data and gas limit.
     */
    runPrecompile(code: PrecompileFunc, data: Buffer, gasLimit: BN): ExecResult;
    _loadCode(message: Message): Promise<void>;
    _generateAddress(message: Message): Promise<Buffer>;
    _reduceSenderBalance(account: Account, message: Message): Promise<void>;
    _addToBalance(toAccount: Account, message: Message): Promise<void>;
    _touchAccount(address: Buffer): Promise<void>;
}

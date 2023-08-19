/// <reference types="bn.js" />
/// <reference types="node" />
import { Account, Address, BN } from 'ethereumjs-util';
import { StateManager } from '../state/index';
import { VmError } from '../exceptions';
import Memory from './memory';
import Stack from './stack';
import EEI from './eei';
import { Opcode, OpHandler } from './opcodes';
export interface InterpreterOpts {
    pc?: number;
}
export interface RunState {
    programCounter: number;
    opCode: number;
    memory: Memory;
    memoryWordCount: BN;
    highestMemCost: BN;
    stack: Stack;
    returnStack: Stack;
    code: Buffer;
    validJumps: number[];
    validJumpSubs: number[];
    stateManager: StateManager;
    eei: EEI;
}
export interface InterpreterResult {
    runState?: RunState;
    exceptionError?: VmError;
}
export interface InterpreterStep {
    gasLeft: BN;
    gasRefund: BN;
    stateManager: StateManager;
    stack: BN[];
    returnStack: BN[];
    pc: number;
    depth: number;
    address: Address;
    memory: Buffer;
    memoryWordCount: BN;
    opcode: {
        name: string;
        fee: number;
        isAsync: boolean;
    };
    account: Account;
    codeAddress: Address;
}
interface JumpDests {
    jumps: number[];
    jumpSubs: number[];
}
/**
 * Parses and executes EVM bytecode.
 */
export default class Interpreter {
    _vm: any;
    _state: StateManager;
    _runState: RunState;
    _eei: EEI;
    private opDebuggers;
    constructor(vm: any, eei: EEI);
    run(code: Buffer, opts?: InterpreterOpts): Promise<InterpreterResult>;
    /**
     * Executes the opcode to which the program counter is pointing,
     * reducing its base gas cost, and increments the program counter.
     */
    runStep(): Promise<void>;
    /**
     * Get the handler function for an opcode.
     */
    getOpHandler(opInfo: Opcode): OpHandler;
    /**
     * Get info for an opcode from VM's list of opcodes.
     */
    lookupOpInfo(op: number): Opcode;
    _runStepHook(): Promise<void>;
    _getValidJumpDests(code: Buffer): JumpDests;
}
export {};

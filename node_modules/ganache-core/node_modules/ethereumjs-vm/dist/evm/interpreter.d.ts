/// <reference types="node" />
import BN = require('bn.js');
import Common from 'ethereumjs-common';
import { StateManager } from '../state';
import PStateManager from '../state/promisified';
import { VmError } from '../exceptions';
import Memory from './memory';
import Stack from './stack';
import EEI from './eei';
import { Opcode } from './opcodes';
import { OpHandler } from './opFns';
import Account from 'ethereumjs-account';
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
    code: Buffer;
    validJumps: number[];
    _common: Common;
    stateManager: StateManager;
    eei: EEI;
}
export interface InterpreterResult {
    runState?: RunState;
    exceptionError?: VmError;
}
export interface InterpreterStep {
    gasLeft: BN;
    stateManager: StateManager;
    stack: BN[];
    pc: number;
    depth: number;
    address: Buffer;
    memory: number[];
    memoryWordCount: BN;
    opcode: Opcode;
    account: Account;
    codeAddress: Buffer;
}
/**
 * Parses and executes EVM bytecode.
 */
export default class Interpreter {
    _vm: any;
    _state: PStateManager;
    _runState: RunState;
    _eei: EEI;
    constructor(vm: any, eei: EEI);
    run(code: Buffer, opts?: InterpreterOpts): Promise<InterpreterResult>;
    /**
     * Executes the opcode to which the program counter is pointing,
     * reducing it's base gas cost, and increments the program counter.
     */
    runStep(): Promise<void>;
    /**
     * Get the handler function for an opcode.
     */
    getOpHandler(opInfo: Opcode): OpHandler;
    /**
     * Get info for an opcode from VM's list of opcodes.
     */
    lookupOpInfo(op: number, full?: boolean): Opcode;
    _runStepHook(): Promise<void>;
    _getValidJumpDests(code: Buffer): number[];
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("debug");
const ethereumjs_util_1 = require("ethereumjs-util");
const exceptions_1 = require("../exceptions");
const memory_1 = __importDefault(require("./memory"));
const stack_1 = __importDefault(require("./stack"));
const opcodes_1 = require("./opcodes");
/**
 * Parses and executes EVM bytecode.
 */
class Interpreter {
    constructor(vm, eei) {
        // Opcode debuggers (e.g. { 'push': [debug Object], 'sstore': [debug Object], ...})
        this.opDebuggers = {};
        this._vm = vm;
        this._state = vm.stateManager;
        this._eei = eei;
        this._runState = {
            programCounter: 0,
            opCode: 0xfe,
            memory: new memory_1.default(),
            memoryWordCount: new ethereumjs_util_1.BN(0),
            highestMemCost: new ethereumjs_util_1.BN(0),
            stack: new stack_1.default(),
            returnStack: new stack_1.default(1023),
            code: Buffer.alloc(0),
            validJumps: [],
            validJumpSubs: [],
            stateManager: this._state,
            eei: this._eei,
        };
    }
    async run(code, opts = {}) {
        var _a;
        this._runState.code = code;
        this._runState.programCounter = (_a = opts.pc) !== null && _a !== void 0 ? _a : this._runState.programCounter;
        const valid = this._getValidJumpDests(code);
        this._runState.validJumps = valid.jumps;
        this._runState.validJumpSubs = valid.jumpSubs;
        // Check that the programCounter is in range
        const pc = this._runState.programCounter;
        if (pc !== 0 && (pc < 0 || pc >= this._runState.code.length)) {
            throw new Error('Internal error: program counter not in range');
        }
        let err;
        // Iterate through the given ops until something breaks or we hit STOP
        while (this._runState.programCounter < this._runState.code.length) {
            const opCode = this._runState.code[this._runState.programCounter];
            this._runState.opCode = opCode;
            await this._runStepHook();
            try {
                await this.runStep();
            }
            catch (e) {
                // re-throw on non-VM errors
                if (!('errorType' in e && e.errorType === 'VmError')) {
                    throw e;
                }
                // STOP is not an exception
                if (e.error !== exceptions_1.ERROR.STOP) {
                    err = e;
                }
                break;
            }
        }
        return {
            runState: this._runState,
            exceptionError: err,
        };
    }
    /**
     * Executes the opcode to which the program counter is pointing,
     * reducing its base gas cost, and increments the program counter.
     */
    async runStep() {
        const opInfo = this.lookupOpInfo(this._runState.opCode);
        // Check for invalid opcode
        if (opInfo.name === 'INVALID') {
            throw new exceptions_1.VmError(exceptions_1.ERROR.INVALID_OPCODE);
        }
        // Reduce opcode's base fee
        this._eei.useGas(new ethereumjs_util_1.BN(opInfo.fee), `${opInfo.name} (base fee)`);
        // Advance program counter
        this._runState.programCounter++;
        // Execute opcode handler
        const opFn = this.getOpHandler(opInfo);
        if (opInfo.isAsync) {
            await opFn.apply(null, [this._runState, this._vm._common]);
        }
        else {
            opFn.apply(null, [this._runState, this._vm._common]);
        }
    }
    /**
     * Get the handler function for an opcode.
     */
    getOpHandler(opInfo) {
        return opcodes_1.handlers.get(opInfo.code);
    }
    /**
     * Get info for an opcode from VM's list of opcodes.
     */
    lookupOpInfo(op) {
        var _a;
        // if not found, return 0xfe: INVALID
        return (_a = this._vm._opcodes.get(op)) !== null && _a !== void 0 ? _a : this._vm._opcodes.get(0xfe);
    }
    async _runStepHook() {
        const opcode = this.lookupOpInfo(this._runState.opCode);
        const eventObj = {
            pc: this._runState.programCounter,
            gasLeft: this._eei.getGasLeft(),
            gasRefund: this._eei._evm._refund,
            opcode: {
                name: opcode.fullName,
                fee: opcode.fee,
                isAsync: opcode.isAsync,
            },
            stack: this._runState.stack._store,
            returnStack: this._runState.returnStack._store,
            depth: this._eei._env.depth,
            address: this._eei._env.address,
            account: this._eei._env.contract,
            stateManager: this._runState.stateManager,
            memory: this._runState.memory._store,
            memoryWordCount: this._runState.memoryWordCount,
            codeAddress: this._eei._env.codeAddress,
        };
        if (this._vm.DEBUG) {
            // Create opTrace for debug functionality
            let hexStack = [];
            hexStack = eventObj.stack.map((item) => {
                return '0x' + new ethereumjs_util_1.BN(item).toString(16, 0);
            });
            const name = eventObj.opcode.name;
            const opTrace = {
                pc: eventObj.pc,
                op: name,
                gas: '0x' + eventObj.gasLeft.toString('hex'),
                gasCost: '0x' + eventObj.opcode.fee.toString(16),
                stack: hexStack,
                depth: eventObj.depth,
            };
            if (!(name in this.opDebuggers)) {
                this.opDebuggers[name] = (0, debug_1.debug)(`vm:ops:${name}`);
            }
            this.opDebuggers[name](JSON.stringify(opTrace));
        }
        /**
         * The `step` event for trace output
         *
         * @event Event: step
         * @type {Object}
         * @property {Number} pc representing the program counter
         * @property {String} opcode the next opcode to be ran
         * @property {BN} gasLeft amount of gasLeft
         * @property {Array} stack an `Array` of `Buffers` containing the stack
         * @property {Account} account the Account which owns the code running
         * @property {Address} address the address of the `account`
         * @property {Number} depth the current number of calls deep the contract is
         * @property {Buffer} memory the memory of the VM as a `buffer`
         * @property {BN} memoryWordCount current size of memory in words
         * @property {StateManager} stateManager a {@link StateManager} instance
         * @property {Address} codeAddress the address of the code which is currently being ran (this differs from `address` in a `DELEGATECALL` and `CALLCODE` call)
         */
        return this._vm._emit('step', eventObj);
    }
    // Returns all valid jump and jumpsub destinations.
    _getValidJumpDests(code) {
        const jumps = [];
        const jumpSubs = [];
        for (let i = 0; i < code.length; i++) {
            const curOpCode = this.lookupOpInfo(code[i]).name;
            // no destinations into the middle of PUSH
            if (curOpCode === 'PUSH') {
                i += code[i] - 0x5f;
            }
            if (curOpCode === 'JUMPDEST') {
                jumps.push(i);
            }
            if (curOpCode === 'BEGINSUB') {
                jumpSubs.push(i);
            }
        }
        return { jumps, jumpSubs };
    }
}
exports.default = Interpreter;
//# sourceMappingURL=interpreter.js.map
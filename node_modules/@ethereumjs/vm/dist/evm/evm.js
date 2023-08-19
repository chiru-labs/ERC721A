"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VmErrorResult = exports.INVALID_BYTECODE_RESULT = exports.COOGResult = exports.OOGResult = void 0;
const debug_1 = require("debug");
const ethereumjs_util_1 = require("ethereumjs-util");
const block_1 = require("@ethereumjs/block");
const exceptions_1 = require("../exceptions");
const precompiles_1 = require("./precompiles");
const eei_1 = __importDefault(require("./eei"));
// eslint-disable-next-line
const util_1 = require("./opcodes/util");
const interpreter_1 = __importDefault(require("./interpreter"));
const debug = (0, debug_1.debug)('vm:evm');
const debugGas = (0, debug_1.debug)('vm:evm:gas');
function OOGResult(gasLimit) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasLimit,
        exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.OUT_OF_GAS),
    };
}
exports.OOGResult = OOGResult;
// CodeDeposit OOG Result
function COOGResult(gasUsedCreateCode) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasUsedCreateCode,
        exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.CODESTORE_OUT_OF_GAS),
    };
}
exports.COOGResult = COOGResult;
function INVALID_BYTECODE_RESULT(gasLimit) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasLimit,
        exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.INVALID_BYTECODE_RESULT),
    };
}
exports.INVALID_BYTECODE_RESULT = INVALID_BYTECODE_RESULT;
function VmErrorResult(error, gasUsed) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasUsed,
        exceptionError: error,
    };
}
exports.VmErrorResult = VmErrorResult;
/**
 * EVM is responsible for executing an EVM message fully
 * (including any nested calls and creates), processing the results
 * and storing them to state (or discarding changes in case of exceptions).
 * @ignore
 */
class EVM {
    constructor(vm, txContext, block) {
        this._vm = vm;
        this._state = this._vm.stateManager;
        this._tx = txContext;
        this._block = block;
        this._refund = new ethereumjs_util_1.BN(0);
    }
    /**
     * Executes an EVM message, determining whether it's a call or create
     * based on the `to` address. It checkpoints the state and reverts changes
     * if an exception happens during the message execution.
     */
    async executeMessage(message) {
        await this._vm._emit('beforeMessage', message);
        if (!message.to && this._vm._common.isActivatedEIP(2929)) {
            message.code = message.data;
            this._state.addWarmedAddress((await this._generateAddress(message)).buf);
        }
        await this._state.checkpoint();
        if (this._vm.DEBUG) {
            debug('-'.repeat(100));
            debug(`message checkpoint`);
        }
        let result;
        if (this._vm.DEBUG) {
            debug(`New message caller=${message.caller} gasLimit=${message.gasLimit} to=${message.to ? message.to.toString() : ''} value=${message.value} delegatecall=${message.delegatecall ? 'yes' : 'no'}`);
        }
        if (message.to) {
            if (this._vm.DEBUG) {
                debug(`Message CALL execution (to: ${message.to})`);
            }
            result = await this._executeCall(message);
        }
        else {
            if (this._vm.DEBUG) {
                debug(`Message CREATE execution (to undefined)`);
            }
            result = await this._executeCreate(message);
        }
        if (this._vm.DEBUG) {
            debug(`Received message results gasUsed=${result.gasUsed} execResult: [ gasUsed=${result.gasUsed} exceptionError=${result.execResult.exceptionError ? result.execResult.exceptionError.toString() : ''} returnValue=${(0, util_1.short)(result.execResult.returnValue)} gasRefund=${result.execResult.gasRefund} ]`);
        }
        // TODO: Move `gasRefund` to a tx-level result object
        // instead of `ExecResult`.
        result.execResult.gasRefund = this._refund.clone();
        const err = result.execResult.exceptionError;
        if (err) {
            if (this._vm._common.gteHardfork('homestead') || err.error != exceptions_1.ERROR.CODESTORE_OUT_OF_GAS) {
                result.execResult.logs = [];
                await this._state.revert();
                if (this._vm.DEBUG) {
                    debug(`message checkpoint reverted`);
                }
            }
            else {
                // we are in chainstart and the error was the code deposit error
                // we do like nothing happened.
                await this._state.commit();
                if (this._vm.DEBUG) {
                    debug(`message checkpoint committed`);
                }
            }
        }
        else {
            await this._state.commit();
            if (this._vm.DEBUG) {
                debug(`message checkpoint committed`);
            }
        }
        await this._vm._emit('afterMessage', result);
        return result;
    }
    async _executeCall(message) {
        const account = await this._state.getAccount(message.caller);
        // Reduce tx value from sender
        if (!message.delegatecall) {
            await this._reduceSenderBalance(account, message);
        }
        // Load `to` account
        const toAccount = await this._state.getAccount(message.to);
        // Add tx value to the `to` account
        let errorMessage;
        if (!message.delegatecall) {
            try {
                await this._addToBalance(toAccount, message);
            }
            catch (e) {
                errorMessage = e;
            }
        }
        // Load code
        await this._loadCode(message);
        let exit = false;
        if (!message.code || message.code.length === 0) {
            exit = true;
            if (this._vm.DEBUG) {
                debug(`Exit early on no code`);
            }
        }
        if (errorMessage) {
            exit = true;
            if (this._vm.DEBUG) {
                debug(`Exit early on value tranfer overflowed`);
            }
        }
        if (exit) {
            return {
                gasUsed: new ethereumjs_util_1.BN(0),
                execResult: {
                    gasUsed: new ethereumjs_util_1.BN(0),
                    exceptionError: errorMessage,
                    returnValue: Buffer.alloc(0),
                },
            };
        }
        let result;
        if (message.isCompiled) {
            if (this._vm.DEBUG) {
                debug(`Run precompile`);
            }
            result = await this.runPrecompile(message.code, message.data, message.gasLimit);
        }
        else {
            if (this._vm.DEBUG) {
                debug(`Start bytecode processing...`);
            }
            result = await this.runInterpreter(message);
        }
        return {
            gasUsed: result.gasUsed,
            execResult: result,
        };
    }
    async _executeCreate(message) {
        const account = await this._state.getAccount(message.caller);
        // Reduce tx value from sender
        await this._reduceSenderBalance(account, message);
        message.code = message.data;
        message.data = Buffer.alloc(0);
        message.to = await this._generateAddress(message);
        if (this._vm.DEBUG) {
            debug(`Generated CREATE contract address ${message.to}`);
        }
        let toAccount = await this._state.getAccount(message.to);
        // Check for collision
        if ((toAccount.nonce && toAccount.nonce.gtn(0)) || !toAccount.codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
            if (this._vm.DEBUG) {
                debug(`Returning on address collision`);
            }
            return {
                gasUsed: message.gasLimit,
                createdAddress: message.to,
                execResult: {
                    returnValue: Buffer.alloc(0),
                    exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.CREATE_COLLISION),
                    gasUsed: message.gasLimit,
                },
            };
        }
        await this._state.clearContractStorage(message.to);
        const newContractEvent = {
            address: message.to,
            code: message.code,
        };
        await this._vm._emit('newContract', newContractEvent);
        toAccount = await this._state.getAccount(message.to);
        // EIP-161 on account creation and CREATE execution
        if (this._vm._common.gteHardfork('spuriousDragon')) {
            toAccount.nonce.iaddn(1);
        }
        // Add tx value to the `to` account
        let errorMessage;
        try {
            await this._addToBalance(toAccount, message);
        }
        catch (e) {
            errorMessage = e;
        }
        let exit = false;
        if (!message.code || message.code.length === 0) {
            exit = true;
            if (this._vm.DEBUG) {
                debug(`Exit early on no code`);
            }
        }
        if (errorMessage) {
            exit = true;
            if (this._vm.DEBUG) {
                debug(`Exit early on value tranfer overflowed`);
            }
        }
        if (exit) {
            return {
                gasUsed: new ethereumjs_util_1.BN(0),
                createdAddress: message.to,
                execResult: {
                    gasUsed: new ethereumjs_util_1.BN(0),
                    exceptionError: errorMessage,
                    returnValue: Buffer.alloc(0),
                },
            };
        }
        if (this._vm.DEBUG) {
            debug(`Start bytecode processing...`);
        }
        let result = await this.runInterpreter(message);
        // fee for size of the return value
        let totalGas = result.gasUsed;
        let returnFee = new ethereumjs_util_1.BN(0);
        if (!result.exceptionError) {
            returnFee = new ethereumjs_util_1.BN(result.returnValue.length).imuln(this._vm._common.param('gasPrices', 'createData'));
            totalGas = totalGas.add(returnFee);
            if (this._vm.DEBUG) {
                debugGas(`Add return value size fee (${returnFee} to gas used (-> ${totalGas}))`);
            }
        }
        // Check for SpuriousDragon EIP-170 code size limit
        let allowedCodeSize = true;
        if (this._vm._common.gteHardfork('spuriousDragon') &&
            result.returnValue.length > this._vm._common.param('vm', 'maxCodeSize')) {
            allowedCodeSize = false;
        }
        // If enough gas and allowed code size
        let CodestoreOOG = false;
        if (totalGas.lte(message.gasLimit) &&
            (this._vm._allowUnlimitedContractSize || allowedCodeSize)) {
            if (this._vm._common.isActivatedEIP(3541) &&
                result.returnValue.slice(0, 1).equals(Buffer.from('EF', 'hex'))) {
                result = Object.assign(Object.assign({}, result), INVALID_BYTECODE_RESULT(message.gasLimit));
            }
            else {
                result.gasUsed = totalGas;
            }
        }
        else {
            if (this._vm._common.gteHardfork('homestead')) {
                if (this._vm.DEBUG) {
                    debug(`Not enough gas or code size not allowed (>= Homestead)`);
                }
                result = Object.assign(Object.assign({}, result), OOGResult(message.gasLimit));
            }
            else {
                // we are in Frontier
                if (this._vm.DEBUG) {
                    debug(`Not enough gas or code size not allowed (Frontier)`);
                }
                if (totalGas.sub(returnFee).lte(message.gasLimit)) {
                    // we cannot pay the code deposit fee (but the deposit code actually did run)
                    result = Object.assign(Object.assign({}, result), COOGResult(totalGas.sub(returnFee)));
                    CodestoreOOG = true;
                }
                else {
                    result = Object.assign(Object.assign({}, result), OOGResult(message.gasLimit));
                }
            }
        }
        // Save code if a new contract was created
        if (!result.exceptionError && result.returnValue && result.returnValue.toString() !== '') {
            await this._state.putContractCode(message.to, result.returnValue);
            if (this._vm.DEBUG) {
                debug(`Code saved on new contract creation`);
            }
        }
        else if (CodestoreOOG) {
            // This only happens at Frontier. But, let's do a sanity check;
            if (!this._vm._common.gteHardfork('homestead')) {
                // Pre-Homestead behavior; put an empty contract.
                // This contract would be considered "DEAD" in later hard forks.
                // It is thus an unecessary default item, which we have to save to dik
                // It does change the state root, but it only wastes storage.
                //await this._state.putContractCode(message.to, result.returnValue)
                const account = await this._state.getAccount(message.to);
                await this._state.putAccount(message.to, account);
            }
        }
        return {
            gasUsed: result.gasUsed,
            createdAddress: message.to,
            execResult: result,
        };
    }
    /**
     * Starts the actual bytecode processing for a CALL or CREATE, providing
     * it with the {@link EEI}.
     */
    async runInterpreter(message, opts = {}) {
        const env = {
            blockchain: this._vm.blockchain,
            address: message.to || ethereumjs_util_1.Address.zero(),
            caller: message.caller || ethereumjs_util_1.Address.zero(),
            callData: message.data || Buffer.from([0]),
            callValue: message.value || new ethereumjs_util_1.BN(0),
            code: message.code,
            isStatic: message.isStatic || false,
            depth: message.depth || 0,
            gasPrice: this._tx.gasPrice,
            origin: this._tx.origin || message.caller || ethereumjs_util_1.Address.zero(),
            block: this._block || new block_1.Block(),
            contract: await this._state.getAccount(message.to || ethereumjs_util_1.Address.zero()),
            codeAddress: message.codeAddress,
        };
        const eei = new eei_1.default(env, this._state, this, this._vm._common, message.gasLimit.clone());
        if (message.selfdestruct) {
            eei._result.selfdestruct = message.selfdestruct;
        }
        const oldRefund = this._refund.clone();
        const interpreter = new interpreter_1.default(this._vm, eei);
        const interpreterRes = await interpreter.run(message.code, opts);
        let result = eei._result;
        let gasUsed = message.gasLimit.sub(eei._gasLeft);
        if (interpreterRes.exceptionError) {
            if (interpreterRes.exceptionError.error !== exceptions_1.ERROR.REVERT) {
                gasUsed = message.gasLimit;
            }
            // Clear the result on error
            result = Object.assign(Object.assign({}, result), { logs: [], selfdestruct: {} });
            // Revert gas refund if message failed
            this._refund = oldRefund;
        }
        return Object.assign(Object.assign({}, result), { runState: Object.assign(Object.assign(Object.assign({}, interpreterRes.runState), result), eei._env), exceptionError: interpreterRes.exceptionError, gas: eei._gasLeft, gasUsed, returnValue: result.returnValue ? result.returnValue : Buffer.alloc(0) });
    }
    /**
     * Returns code for precompile at the given address, or undefined
     * if no such precompile exists.
     */
    getPrecompile(address) {
        return (0, precompiles_1.getPrecompile)(address, this._vm._common);
    }
    /**
     * Executes a precompiled contract with given data and gas limit.
     */
    runPrecompile(code, data, gasLimit) {
        if (typeof code !== 'function') {
            throw new Error('Invalid precompile');
        }
        const opts = {
            data,
            gasLimit,
            _common: this._vm._common,
            _VM: this._vm,
        };
        return code(opts);
    }
    async _loadCode(message) {
        if (!message.code) {
            const precompile = this.getPrecompile(message.codeAddress);
            if (precompile) {
                message.code = precompile;
                message.isCompiled = true;
            }
            else {
                message.code = await this._state.getContractCode(message.codeAddress);
                message.isCompiled = false;
            }
        }
    }
    async _generateAddress(message) {
        let addr;
        if (message.salt) {
            addr = (0, ethereumjs_util_1.generateAddress2)(message.caller.buf, message.salt, message.code);
        }
        else {
            const acc = await this._state.getAccount(message.caller);
            const newNonce = acc.nonce.subn(1);
            addr = (0, ethereumjs_util_1.generateAddress)(message.caller.buf, newNonce.toArrayLike(Buffer));
        }
        return new ethereumjs_util_1.Address(addr);
    }
    async _reduceSenderBalance(account, message) {
        account.balance.isub(message.value);
        const result = this._state.putAccount(message.caller, account);
        if (this._vm.DEBUG) {
            debug(`Reduced sender (${message.caller}) balance (-> ${account.balance})`);
        }
        return result;
    }
    async _addToBalance(toAccount, message) {
        const newBalance = toAccount.balance.add(message.value);
        if (newBalance.gt(ethereumjs_util_1.MAX_INTEGER)) {
            throw new exceptions_1.VmError(exceptions_1.ERROR.VALUE_OVERFLOW);
        }
        toAccount.balance = newBalance;
        // putAccount as the nonce may have changed for contract creation
        const result = this._state.putAccount(message.to, toAccount);
        if (this._vm.DEBUG) {
            debug(`Added toAccount (${message.to}) balance (-> ${toAccount.balance})`);
        }
        return result;
    }
    async _touchAccount(address) {
        const account = await this._state.getAccount(address);
        return this._state.putAccount(address, account);
    }
}
exports.default = EVM;
//# sourceMappingURL=evm.js.map
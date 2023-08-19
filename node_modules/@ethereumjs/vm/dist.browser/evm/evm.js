"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VmErrorResult = exports.INVALID_BYTECODE_RESULT = exports.COOGResult = exports.OOGResult = void 0;
var debug_1 = require("debug");
var ethereumjs_util_1 = require("ethereumjs-util");
var block_1 = require("@ethereumjs/block");
var exceptions_1 = require("../exceptions");
var precompiles_1 = require("./precompiles");
var eei_1 = __importDefault(require("./eei"));
// eslint-disable-next-line
var util_1 = require("./opcodes/util");
var interpreter_1 = __importDefault(require("./interpreter"));
var debug = (0, debug_1.debug)('vm:evm');
var debugGas = (0, debug_1.debug)('vm:evm:gas');
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
var EVM = /** @class */ (function () {
    function EVM(vm, txContext, block) {
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
    EVM.prototype.executeMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, result, err;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._vm._emit('beforeMessage', message)];
                    case 1:
                        _c.sent();
                        if (!(!message.to && this._vm._common.isActivatedEIP(2929))) return [3 /*break*/, 3];
                        message.code = message.data;
                        _b = (_a = this._state).addWarmedAddress;
                        return [4 /*yield*/, this._generateAddress(message)];
                    case 2:
                        _b.apply(_a, [(_c.sent()).buf]);
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this._state.checkpoint()];
                    case 4:
                        _c.sent();
                        if (this._vm.DEBUG) {
                            debug('-'.repeat(100));
                            debug("message checkpoint");
                        }
                        if (this._vm.DEBUG) {
                            debug("New message caller=" + message.caller + " gasLimit=" + message.gasLimit + " to=" + (message.to ? message.to.toString() : '') + " value=" + message.value + " delegatecall=" + (message.delegatecall ? 'yes' : 'no'));
                        }
                        if (!message.to) return [3 /*break*/, 6];
                        if (this._vm.DEBUG) {
                            debug("Message CALL execution (to: " + message.to + ")");
                        }
                        return [4 /*yield*/, this._executeCall(message)];
                    case 5:
                        result = _c.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        if (this._vm.DEBUG) {
                            debug("Message CREATE execution (to undefined)");
                        }
                        return [4 /*yield*/, this._executeCreate(message)];
                    case 7:
                        result = _c.sent();
                        _c.label = 8;
                    case 8:
                        if (this._vm.DEBUG) {
                            debug("Received message results gasUsed=" + result.gasUsed + " execResult: [ gasUsed=" + result.gasUsed + " exceptionError=" + (result.execResult.exceptionError ? result.execResult.exceptionError.toString() : '') + " returnValue=" + (0, util_1.short)(result.execResult.returnValue) + " gasRefund=" + result.execResult.gasRefund + " ]");
                        }
                        // TODO: Move `gasRefund` to a tx-level result object
                        // instead of `ExecResult`.
                        result.execResult.gasRefund = this._refund.clone();
                        err = result.execResult.exceptionError;
                        if (!err) return [3 /*break*/, 13];
                        if (!(this._vm._common.gteHardfork('homestead') || err.error != exceptions_1.ERROR.CODESTORE_OUT_OF_GAS)) return [3 /*break*/, 10];
                        result.execResult.logs = [];
                        return [4 /*yield*/, this._state.revert()];
                    case 9:
                        _c.sent();
                        if (this._vm.DEBUG) {
                            debug("message checkpoint reverted");
                        }
                        return [3 /*break*/, 12];
                    case 10: 
                    // we are in chainstart and the error was the code deposit error
                    // we do like nothing happened.
                    return [4 /*yield*/, this._state.commit()];
                    case 11:
                        // we are in chainstart and the error was the code deposit error
                        // we do like nothing happened.
                        _c.sent();
                        if (this._vm.DEBUG) {
                            debug("message checkpoint committed");
                        }
                        _c.label = 12;
                    case 12: return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, this._state.commit()];
                    case 14:
                        _c.sent();
                        if (this._vm.DEBUG) {
                            debug("message checkpoint committed");
                        }
                        _c.label = 15;
                    case 15: return [4 /*yield*/, this._vm._emit('afterMessage', result)];
                    case 16:
                        _c.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    EVM.prototype._executeCall = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var account, toAccount, errorMessage, e_1, exit, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._state.getAccount(message.caller)
                        // Reduce tx value from sender
                    ];
                    case 1:
                        account = _a.sent();
                        if (!!message.delegatecall) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._reduceSenderBalance(account, message)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this._state.getAccount(message.to)
                        // Add tx value to the `to` account
                    ];
                    case 4:
                        toAccount = _a.sent();
                        if (!!message.delegatecall) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this._addToBalance(toAccount, message)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        errorMessage = e_1;
                        return [3 /*break*/, 8];
                    case 8: 
                    // Load code
                    return [4 /*yield*/, this._loadCode(message)];
                    case 9:
                        // Load code
                        _a.sent();
                        exit = false;
                        if (!message.code || message.code.length === 0) {
                            exit = true;
                            if (this._vm.DEBUG) {
                                debug("Exit early on no code");
                            }
                        }
                        if (errorMessage) {
                            exit = true;
                            if (this._vm.DEBUG) {
                                debug("Exit early on value tranfer overflowed");
                            }
                        }
                        if (exit) {
                            return [2 /*return*/, {
                                    gasUsed: new ethereumjs_util_1.BN(0),
                                    execResult: {
                                        gasUsed: new ethereumjs_util_1.BN(0),
                                        exceptionError: errorMessage,
                                        returnValue: Buffer.alloc(0),
                                    },
                                }];
                        }
                        if (!message.isCompiled) return [3 /*break*/, 11];
                        if (this._vm.DEBUG) {
                            debug("Run precompile");
                        }
                        return [4 /*yield*/, this.runPrecompile(message.code, message.data, message.gasLimit)];
                    case 10:
                        result = _a.sent();
                        return [3 /*break*/, 13];
                    case 11:
                        if (this._vm.DEBUG) {
                            debug("Start bytecode processing...");
                        }
                        return [4 /*yield*/, this.runInterpreter(message)];
                    case 12:
                        result = _a.sent();
                        _a.label = 13;
                    case 13: return [2 /*return*/, {
                            gasUsed: result.gasUsed,
                            execResult: result,
                        }];
                }
            });
        });
    };
    EVM.prototype._executeCreate = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var account, _a, toAccount, newContractEvent, errorMessage, e_2, exit, result, totalGas, returnFee, allowedCodeSize, CodestoreOOG, account_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._state.getAccount(message.caller)
                        // Reduce tx value from sender
                    ];
                    case 1:
                        account = _b.sent();
                        // Reduce tx value from sender
                        return [4 /*yield*/, this._reduceSenderBalance(account, message)];
                    case 2:
                        // Reduce tx value from sender
                        _b.sent();
                        message.code = message.data;
                        message.data = Buffer.alloc(0);
                        _a = message;
                        return [4 /*yield*/, this._generateAddress(message)];
                    case 3:
                        _a.to = _b.sent();
                        if (this._vm.DEBUG) {
                            debug("Generated CREATE contract address " + message.to);
                        }
                        return [4 /*yield*/, this._state.getAccount(message.to)
                            // Check for collision
                        ];
                    case 4:
                        toAccount = _b.sent();
                        // Check for collision
                        if ((toAccount.nonce && toAccount.nonce.gtn(0)) || !toAccount.codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
                            if (this._vm.DEBUG) {
                                debug("Returning on address collision");
                            }
                            return [2 /*return*/, {
                                    gasUsed: message.gasLimit,
                                    createdAddress: message.to,
                                    execResult: {
                                        returnValue: Buffer.alloc(0),
                                        exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.CREATE_COLLISION),
                                        gasUsed: message.gasLimit,
                                    },
                                }];
                        }
                        return [4 /*yield*/, this._state.clearContractStorage(message.to)];
                    case 5:
                        _b.sent();
                        newContractEvent = {
                            address: message.to,
                            code: message.code,
                        };
                        return [4 /*yield*/, this._vm._emit('newContract', newContractEvent)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this._state.getAccount(message.to)
                            // EIP-161 on account creation and CREATE execution
                        ];
                    case 7:
                        toAccount = _b.sent();
                        // EIP-161 on account creation and CREATE execution
                        if (this._vm._common.gteHardfork('spuriousDragon')) {
                            toAccount.nonce.iaddn(1);
                        }
                        _b.label = 8;
                    case 8:
                        _b.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this._addToBalance(toAccount, message)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_2 = _b.sent();
                        errorMessage = e_2;
                        return [3 /*break*/, 11];
                    case 11:
                        exit = false;
                        if (!message.code || message.code.length === 0) {
                            exit = true;
                            if (this._vm.DEBUG) {
                                debug("Exit early on no code");
                            }
                        }
                        if (errorMessage) {
                            exit = true;
                            if (this._vm.DEBUG) {
                                debug("Exit early on value tranfer overflowed");
                            }
                        }
                        if (exit) {
                            return [2 /*return*/, {
                                    gasUsed: new ethereumjs_util_1.BN(0),
                                    createdAddress: message.to,
                                    execResult: {
                                        gasUsed: new ethereumjs_util_1.BN(0),
                                        exceptionError: errorMessage,
                                        returnValue: Buffer.alloc(0),
                                    },
                                }];
                        }
                        if (this._vm.DEBUG) {
                            debug("Start bytecode processing...");
                        }
                        return [4 /*yield*/, this.runInterpreter(message)
                            // fee for size of the return value
                        ];
                    case 12:
                        result = _b.sent();
                        totalGas = result.gasUsed;
                        returnFee = new ethereumjs_util_1.BN(0);
                        if (!result.exceptionError) {
                            returnFee = new ethereumjs_util_1.BN(result.returnValue.length).imuln(this._vm._common.param('gasPrices', 'createData'));
                            totalGas = totalGas.add(returnFee);
                            if (this._vm.DEBUG) {
                                debugGas("Add return value size fee (" + returnFee + " to gas used (-> " + totalGas + "))");
                            }
                        }
                        allowedCodeSize = true;
                        if (this._vm._common.gteHardfork('spuriousDragon') &&
                            result.returnValue.length > this._vm._common.param('vm', 'maxCodeSize')) {
                            allowedCodeSize = false;
                        }
                        CodestoreOOG = false;
                        if (totalGas.lte(message.gasLimit) &&
                            (this._vm._allowUnlimitedContractSize || allowedCodeSize)) {
                            if (this._vm._common.isActivatedEIP(3541) &&
                                result.returnValue.slice(0, 1).equals(Buffer.from('EF', 'hex'))) {
                                result = __assign(__assign({}, result), INVALID_BYTECODE_RESULT(message.gasLimit));
                            }
                            else {
                                result.gasUsed = totalGas;
                            }
                        }
                        else {
                            if (this._vm._common.gteHardfork('homestead')) {
                                if (this._vm.DEBUG) {
                                    debug("Not enough gas or code size not allowed (>= Homestead)");
                                }
                                result = __assign(__assign({}, result), OOGResult(message.gasLimit));
                            }
                            else {
                                // we are in Frontier
                                if (this._vm.DEBUG) {
                                    debug("Not enough gas or code size not allowed (Frontier)");
                                }
                                if (totalGas.sub(returnFee).lte(message.gasLimit)) {
                                    // we cannot pay the code deposit fee (but the deposit code actually did run)
                                    result = __assign(__assign({}, result), COOGResult(totalGas.sub(returnFee)));
                                    CodestoreOOG = true;
                                }
                                else {
                                    result = __assign(__assign({}, result), OOGResult(message.gasLimit));
                                }
                            }
                        }
                        if (!(!result.exceptionError && result.returnValue && result.returnValue.toString() !== '')) return [3 /*break*/, 14];
                        return [4 /*yield*/, this._state.putContractCode(message.to, result.returnValue)];
                    case 13:
                        _b.sent();
                        if (this._vm.DEBUG) {
                            debug("Code saved on new contract creation");
                        }
                        return [3 /*break*/, 17];
                    case 14:
                        if (!CodestoreOOG) return [3 /*break*/, 17];
                        if (!!this._vm._common.gteHardfork('homestead')) return [3 /*break*/, 17];
                        return [4 /*yield*/, this._state.getAccount(message.to)];
                    case 15:
                        account_1 = _b.sent();
                        return [4 /*yield*/, this._state.putAccount(message.to, account_1)];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17: return [2 /*return*/, {
                            gasUsed: result.gasUsed,
                            createdAddress: message.to,
                            execResult: result,
                        }];
                }
            });
        });
    };
    /**
     * Starts the actual bytecode processing for a CALL or CREATE, providing
     * it with the {@link EEI}.
     */
    EVM.prototype.runInterpreter = function (message, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var env, eei, oldRefund, interpreter, interpreterRes, result, gasUsed;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
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
                            block: this._block || new block_1.Block()
                        };
                        return [4 /*yield*/, this._state.getAccount(message.to || ethereumjs_util_1.Address.zero())];
                    case 1:
                        env = (_a.contract = _b.sent(),
                            _a.codeAddress = message.codeAddress,
                            _a);
                        eei = new eei_1.default(env, this._state, this, this._vm._common, message.gasLimit.clone());
                        if (message.selfdestruct) {
                            eei._result.selfdestruct = message.selfdestruct;
                        }
                        oldRefund = this._refund.clone();
                        interpreter = new interpreter_1.default(this._vm, eei);
                        return [4 /*yield*/, interpreter.run(message.code, opts)];
                    case 2:
                        interpreterRes = _b.sent();
                        result = eei._result;
                        gasUsed = message.gasLimit.sub(eei._gasLeft);
                        if (interpreterRes.exceptionError) {
                            if (interpreterRes.exceptionError.error !== exceptions_1.ERROR.REVERT) {
                                gasUsed = message.gasLimit;
                            }
                            // Clear the result on error
                            result = __assign(__assign({}, result), { logs: [], selfdestruct: {} });
                            // Revert gas refund if message failed
                            this._refund = oldRefund;
                        }
                        return [2 /*return*/, __assign(__assign({}, result), { runState: __assign(__assign(__assign({}, interpreterRes.runState), result), eei._env), exceptionError: interpreterRes.exceptionError, gas: eei._gasLeft, gasUsed: gasUsed, returnValue: result.returnValue ? result.returnValue : Buffer.alloc(0) })];
                }
            });
        });
    };
    /**
     * Returns code for precompile at the given address, or undefined
     * if no such precompile exists.
     */
    EVM.prototype.getPrecompile = function (address) {
        return (0, precompiles_1.getPrecompile)(address, this._vm._common);
    };
    /**
     * Executes a precompiled contract with given data and gas limit.
     */
    EVM.prototype.runPrecompile = function (code, data, gasLimit) {
        if (typeof code !== 'function') {
            throw new Error('Invalid precompile');
        }
        var opts = {
            data: data,
            gasLimit: gasLimit,
            _common: this._vm._common,
            _VM: this._vm,
        };
        return code(opts);
    };
    EVM.prototype._loadCode = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var precompile, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!message.code) return [3 /*break*/, 3];
                        precompile = this.getPrecompile(message.codeAddress);
                        if (!precompile) return [3 /*break*/, 1];
                        message.code = precompile;
                        message.isCompiled = true;
                        return [3 /*break*/, 3];
                    case 1:
                        _a = message;
                        return [4 /*yield*/, this._state.getContractCode(message.codeAddress)];
                    case 2:
                        _a.code = _b.sent();
                        message.isCompiled = false;
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EVM.prototype._generateAddress = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var addr, acc, newNonce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!message.salt) return [3 /*break*/, 1];
                        addr = (0, ethereumjs_util_1.generateAddress2)(message.caller.buf, message.salt, message.code);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._state.getAccount(message.caller)];
                    case 2:
                        acc = _a.sent();
                        newNonce = acc.nonce.subn(1);
                        addr = (0, ethereumjs_util_1.generateAddress)(message.caller.buf, newNonce.toArrayLike(Buffer));
                        _a.label = 3;
                    case 3: return [2 /*return*/, new ethereumjs_util_1.Address(addr)];
                }
            });
        });
    };
    EVM.prototype._reduceSenderBalance = function (account, message) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                account.balance.isub(message.value);
                result = this._state.putAccount(message.caller, account);
                if (this._vm.DEBUG) {
                    debug("Reduced sender (" + message.caller + ") balance (-> " + account.balance + ")");
                }
                return [2 /*return*/, result];
            });
        });
    };
    EVM.prototype._addToBalance = function (toAccount, message) {
        return __awaiter(this, void 0, void 0, function () {
            var newBalance, result;
            return __generator(this, function (_a) {
                newBalance = toAccount.balance.add(message.value);
                if (newBalance.gt(ethereumjs_util_1.MAX_INTEGER)) {
                    throw new exceptions_1.VmError(exceptions_1.ERROR.VALUE_OVERFLOW);
                }
                toAccount.balance = newBalance;
                result = this._state.putAccount(message.to, toAccount);
                if (this._vm.DEBUG) {
                    debug("Added toAccount (" + message.to + ") balance (-> " + toAccount.balance + ")");
                }
                return [2 /*return*/, result];
            });
        });
    };
    EVM.prototype._touchAccount = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._state.getAccount(address)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this._state.putAccount(address, account)];
                }
            });
        });
    };
    return EVM;
}());
exports.default = EVM;
//# sourceMappingURL=evm.js.map
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
var debug_1 = require("debug");
var ethereumjs_util_1 = require("ethereumjs-util");
var common_1 = require("@ethereumjs/common");
var exceptions_1 = require("../exceptions");
var message_1 = __importDefault(require("./message"));
var debugGas = (0, debug_1.debug)('vm:eei:gas');
function trap(err) {
    throw new exceptions_1.VmError(err);
}
var MASK_160 = new ethereumjs_util_1.BN(1).shln(160).subn(1);
function addressToBuffer(address) {
    if (Buffer.isBuffer(address))
        return address;
    return address.and(MASK_160).toArrayLike(Buffer, 'be', 20);
}
/**
 * External interface made available to EVM bytecode. Modeled after
 * the ewasm EEI [spec](https://github.com/ewasm/design/blob/master/eth_interface.md).
 * It includes methods for accessing/modifying state, calling or creating contracts, access
 * to environment data among other things.
 * The EEI instance also keeps artifacts produced by the bytecode such as logs
 * and to-be-selfdestructed addresses.
 */
var EEI = /** @class */ (function () {
    function EEI(env, state, evm, common, gasLeft) {
        this._env = env;
        this._state = state;
        this._evm = evm;
        this._lastReturned = Buffer.alloc(0);
        this._common = common;
        this._gasLeft = gasLeft;
        this._result = {
            logs: [],
            returnValue: undefined,
            selfdestruct: {},
        };
    }
    /**
     * Subtracts an amount from the gas counter.
     * @param amount - Amount of gas to consume
     * @param context - Usage context for debugging
     * @throws if out of gas
     */
    EEI.prototype.useGas = function (amount, context) {
        this._gasLeft.isub(amount);
        if (this._evm._vm.DEBUG) {
            debugGas((context ? context + ': ' : '') + "used " + amount + " gas (-> " + this._gasLeft + ")");
        }
        if (this._gasLeft.ltn(0)) {
            this._gasLeft = new ethereumjs_util_1.BN(0);
            trap(exceptions_1.ERROR.OUT_OF_GAS);
        }
    };
    /**
     * Adds a positive amount to the gas counter.
     * @param amount - Amount of gas refunded
     * @param context - Usage context for debugging
     */
    EEI.prototype.refundGas = function (amount, context) {
        if (this._evm._vm.DEBUG) {
            debugGas((context ? context + ': ' : '') + "refund " + amount + " gas (-> " + this._evm._refund + ")");
        }
        this._evm._refund.iadd(amount);
    };
    /**
     * Reduces amount of gas to be refunded by a positive value.
     * @param amount - Amount to subtract from gas refunds
     * @param context - Usage context for debugging
     */
    EEI.prototype.subRefund = function (amount, context) {
        if (this._evm._vm.DEBUG) {
            debugGas((context ? context + ': ' : '') + "sub gas refund " + amount + " (-> " + this._evm._refund + ")");
        }
        this._evm._refund.isub(amount);
        if (this._evm._refund.ltn(0)) {
            this._evm._refund = new ethereumjs_util_1.BN(0);
            trap(exceptions_1.ERROR.REFUND_EXHAUSTED);
        }
    };
    /**
     * Increments the internal gasLeft counter. Used for adding callStipend.
     * @param amount - Amount to add
     */
    EEI.prototype.addStipend = function (amount) {
        if (this._evm._vm.DEBUG) {
            debugGas("add stipend " + amount + " (-> " + this._gasLeft + ")");
        }
        this._gasLeft.iadd(amount);
    };
    /**
     * Returns address of currently executing account.
     */
    EEI.prototype.getAddress = function () {
        return this._env.address;
    };
    /**
     * Returns balance of the given account.
     * @param address - Address of account
     */
    EEI.prototype.getExternalBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // shortcut if current account
                        if (address.equals(this._env.address)) {
                            return [2 /*return*/, this._env.contract.balance];
                        }
                        return [4 /*yield*/, this._state.getAccount(address)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, account.balance];
                }
            });
        });
    };
    /**
     * Returns balance of self.
     */
    EEI.prototype.getSelfBalance = function () {
        return this._env.contract.balance;
    };
    /**
     * Returns caller address. This is the address of the account
     * that is directly responsible for this execution.
     */
    EEI.prototype.getCaller = function () {
        return new ethereumjs_util_1.BN(this._env.caller.buf);
    };
    /**
     * Returns the deposited value by the instruction/transaction
     * responsible for this execution.
     */
    EEI.prototype.getCallValue = function () {
        return new ethereumjs_util_1.BN(this._env.callValue);
    };
    /**
     * Returns input data in current environment. This pertains to the input
     * data passed with the message call instruction or transaction.
     */
    EEI.prototype.getCallData = function () {
        return this._env.callData;
    };
    /**
     * Returns size of input data in current environment. This pertains to the
     * input data passed with the message call instruction or transaction.
     */
    EEI.prototype.getCallDataSize = function () {
        return new ethereumjs_util_1.BN(this._env.callData.length);
    };
    /**
     * Returns the size of code running in current environment.
     */
    EEI.prototype.getCodeSize = function () {
        return new ethereumjs_util_1.BN(this._env.code.length);
    };
    /**
     * Returns the code running in current environment.
     */
    EEI.prototype.getCode = function () {
        return this._env.code;
    };
    /**
     * Returns true if the current call must be executed statically.
     */
    EEI.prototype.isStatic = function () {
        return this._env.isStatic;
    };
    /**
     * Get size of an account’s code.
     * @param address - Address of account
     */
    EEI.prototype.getExternalCodeSize = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var addr, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addr = new ethereumjs_util_1.Address(addressToBuffer(address));
                        return [4 /*yield*/, this._state.getContractCode(addr)];
                    case 1:
                        code = _a.sent();
                        return [2 /*return*/, new ethereumjs_util_1.BN(code.length)];
                }
            });
        });
    };
    /**
     * Returns code of an account.
     * @param address - Address of account
     */
    EEI.prototype.getExternalCode = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var addr;
            return __generator(this, function (_a) {
                addr = new ethereumjs_util_1.Address(addressToBuffer(address));
                return [2 /*return*/, this._state.getContractCode(addr)];
            });
        });
    };
    /**
     * Returns size of current return data buffer. This contains the return data
     * from the last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     */
    EEI.prototype.getReturnDataSize = function () {
        return new ethereumjs_util_1.BN(this._lastReturned.length);
    };
    /**
     * Returns the current return data buffer. This contains the return data
     * from last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     */
    EEI.prototype.getReturnData = function () {
        return this._lastReturned;
    };
    /**
     * Returns price of gas in current environment.
     */
    EEI.prototype.getTxGasPrice = function () {
        return this._env.gasPrice;
    };
    /**
     * Returns the execution's origination address. This is the
     * sender of original transaction; it is never an account with
     * non-empty associated code.
     */
    EEI.prototype.getTxOrigin = function () {
        return new ethereumjs_util_1.BN(this._env.origin.buf);
    };
    /**
     * Returns the block’s number.
     */
    EEI.prototype.getBlockNumber = function () {
        return this._env.block.header.number;
    };
    /**
     * Returns the block's beneficiary address.
     */
    EEI.prototype.getBlockCoinbase = function () {
        var coinbase;
        if (this._common.consensusAlgorithm() === common_1.ConsensusAlgorithm.Clique) {
            // Backwards-compatibilty check
            // TODO: can be removed along VM v5 release
            if ('cliqueSigner' in this._env.block.header) {
                coinbase = this._env.block.header.cliqueSigner();
            }
            else {
                coinbase = ethereumjs_util_1.Address.zero();
            }
        }
        else {
            coinbase = this._env.block.header.coinbase;
        }
        return new ethereumjs_util_1.BN(coinbase.toBuffer());
    };
    /**
     * Returns the block's timestamp.
     */
    EEI.prototype.getBlockTimestamp = function () {
        return this._env.block.header.timestamp;
    };
    /**
     * Returns the block's difficulty.
     */
    EEI.prototype.getBlockDifficulty = function () {
        return this._env.block.header.difficulty;
    };
    /**
     * Returns the block's gas limit.
     */
    EEI.prototype.getBlockGasLimit = function () {
        return this._env.block.header.gasLimit;
    };
    /**
     * Returns the chain ID for current chain. Introduced for the
     * CHAINID opcode proposed in [EIP-1344](https://eips.ethereum.org/EIPS/eip-1344).
     */
    EEI.prototype.getChainId = function () {
        return this._common.chainIdBN();
    };
    /**
     * Returns the Base Fee of the block as proposed in [EIP-3198](https;//eips.etheruem.org/EIPS/eip-3198)
     */
    EEI.prototype.getBlockBaseFee = function () {
        var baseFee = this._env.block.header.baseFeePerGas;
        if (baseFee === undefined) {
            // Sanity check
            throw new Error('Block has no Base Fee');
        }
        return baseFee;
    };
    /**
     * Returns Gets the hash of one of the 256 most recent complete blocks.
     * @param num - Number of block
     */
    EEI.prototype.getBlockHash = function (num) {
        return __awaiter(this, void 0, void 0, function () {
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._env.blockchain.getBlock(num)];
                    case 1:
                        block = _a.sent();
                        return [2 /*return*/, new ethereumjs_util_1.BN(block.hash())];
                }
            });
        });
    };
    /**
     * Store 256-bit a value in memory to persistent storage.
     */
    EEI.prototype.storageStore = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._state.putContractStorage(this._env.address, key, value)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._state.getAccount(this._env.address)];
                    case 2:
                        account = _a.sent();
                        this._env.contract = account;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Loads a 256-bit value to memory from persistent storage.
     * @param key - Storage key
     * @param original - If true, return the original storage value (default: false)
     */
    EEI.prototype.storageLoad = function (key, original) {
        if (original === void 0) { original = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (original) {
                    return [2 /*return*/, this._state.getOriginalContractStorage(this._env.address, key)];
                }
                else {
                    return [2 /*return*/, this._state.getContractStorage(this._env.address, key)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Returns the current gasCounter.
     */
    EEI.prototype.getGasLeft = function () {
        return this._gasLeft.clone();
    };
    /**
     * Set the returning output data for the execution.
     * @param returnData - Output data to return
     */
    EEI.prototype.finish = function (returnData) {
        this._result.returnValue = returnData;
        trap(exceptions_1.ERROR.STOP);
    };
    /**
     * Set the returning output data for the execution. This will halt the
     * execution immediately and set the execution result to "reverted".
     * @param returnData - Output data to return
     */
    EEI.prototype.revert = function (returnData) {
        this._result.returnValue = returnData;
        trap(exceptions_1.ERROR.REVERT);
    };
    /**
     * Mark account for later deletion and give the remaining balance to the
     * specified beneficiary address. This will cause a trap and the
     * execution will be aborted immediately.
     * @param toAddress - Beneficiary address
     */
    EEI.prototype.selfDestruct = function (toAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._selfDestruct(toAddress)];
            });
        });
    };
    EEI.prototype._selfDestruct = function (toAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var toAccount, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // only add to refund if this is the first selfdestruct for the address
                        if (!this._result.selfdestruct[this._env.address.buf.toString('hex')]) {
                            this.refundGas(new ethereumjs_util_1.BN(this._common.param('gasPrices', 'selfdestructRefund')));
                        }
                        this._result.selfdestruct[this._env.address.buf.toString('hex')] = toAddress.buf;
                        return [4 /*yield*/, this._state.getAccount(toAddress)];
                    case 1:
                        toAccount = _a.sent();
                        toAccount.balance.iadd(this._env.contract.balance);
                        return [4 /*yield*/, this._state.putAccount(toAddress, toAccount)
                            // Subtract from contract balance
                        ];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._state.getAccount(this._env.address)];
                    case 3:
                        account = _a.sent();
                        account.balance = new ethereumjs_util_1.BN(0);
                        return [4 /*yield*/, this._state.putAccount(this._env.address, account)];
                    case 4:
                        _a.sent();
                        trap(exceptions_1.ERROR.STOP);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new log in the current environment.
     */
    EEI.prototype.log = function (data, numberOfTopics, topics) {
        if (numberOfTopics < 0 || numberOfTopics > 4) {
            trap(exceptions_1.ERROR.OUT_OF_RANGE);
        }
        if (topics.length !== numberOfTopics) {
            trap(exceptions_1.ERROR.INTERNAL_ERROR);
        }
        var log = [this._env.address.buf, topics, data];
        this._result.logs.push(log);
    };
    /**
     * Sends a message with arbitrary data to a given address path.
     */
    EEI.prototype.call = function (gasLimit, address, value, data) {
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                msg = new message_1.default({
                    caller: this._env.address,
                    gasLimit: gasLimit,
                    to: address,
                    value: value,
                    data: data,
                    isStatic: this._env.isStatic,
                    depth: this._env.depth + 1,
                });
                return [2 /*return*/, this._baseCall(msg)];
            });
        });
    };
    /**
     * Message-call into this account with an alternative account's code.
     */
    EEI.prototype.callCode = function (gasLimit, address, value, data) {
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                msg = new message_1.default({
                    caller: this._env.address,
                    gasLimit: gasLimit,
                    to: this._env.address,
                    codeAddress: address,
                    value: value,
                    data: data,
                    isStatic: this._env.isStatic,
                    depth: this._env.depth + 1,
                });
                return [2 /*return*/, this._baseCall(msg)];
            });
        });
    };
    /**
     * Sends a message with arbitrary data to a given address path, but disallow
     * state modifications. This includes log, create, selfdestruct and call with
     * a non-zero value.
     */
    EEI.prototype.callStatic = function (gasLimit, address, value, data) {
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                msg = new message_1.default({
                    caller: this._env.address,
                    gasLimit: gasLimit,
                    to: address,
                    value: value,
                    data: data,
                    isStatic: true,
                    depth: this._env.depth + 1,
                });
                return [2 /*return*/, this._baseCall(msg)];
            });
        });
    };
    /**
     * Message-call into this account with an alternative account’s code, but
     * persisting the current values for sender and value.
     */
    EEI.prototype.callDelegate = function (gasLimit, address, value, data) {
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                msg = new message_1.default({
                    caller: this._env.caller,
                    gasLimit: gasLimit,
                    to: this._env.address,
                    codeAddress: address,
                    value: value,
                    data: data,
                    isStatic: this._env.isStatic,
                    delegatecall: true,
                    depth: this._env.depth + 1,
                });
                return [2 /*return*/, this._baseCall(msg)];
            });
        });
    };
    EEI.prototype._baseCall = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var selfdestruct, results, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selfdestruct = __assign({}, this._result.selfdestruct);
                        msg.selfdestruct = selfdestruct;
                        // empty the return data buffer
                        this._lastReturned = Buffer.alloc(0);
                        // Check if account has enough ether and max depth not exceeded
                        if (this._env.depth >= this._common.param('vm', 'stackLimit') ||
                            (msg.delegatecall !== true && this._env.contract.balance.lt(msg.value))) {
                            return [2 /*return*/, new ethereumjs_util_1.BN(0)];
                        }
                        return [4 /*yield*/, this._evm.executeMessage(msg)];
                    case 1:
                        results = _a.sent();
                        if (results.execResult.logs) {
                            this._result.logs = this._result.logs.concat(results.execResult.logs);
                        }
                        // this should always be safe
                        this.useGas(results.gasUsed, 'CALL, STATICCALL, DELEGATECALL, CALLCODE');
                        // Set return value
                        if (results.execResult.returnValue &&
                            (!results.execResult.exceptionError ||
                                results.execResult.exceptionError.error === exceptions_1.ERROR.REVERT)) {
                            this._lastReturned = results.execResult.returnValue;
                        }
                        if (!!results.execResult.exceptionError) return [3 /*break*/, 3];
                        Object.assign(this._result.selfdestruct, selfdestruct);
                        return [4 /*yield*/, this._state.getAccount(this._env.address)];
                    case 2:
                        account = _a.sent();
                        this._env.contract = account;
                        _a.label = 3;
                    case 3: return [2 /*return*/, this._getReturnCode(results)];
                }
            });
        });
    };
    /**
     * Creates a new contract with a given value.
     */
    EEI.prototype.create = function (gasLimit, value, data, salt) {
        if (salt === void 0) { salt = null; }
        return __awaiter(this, void 0, void 0, function () {
            var selfdestruct, msg, results, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selfdestruct = __assign({}, this._result.selfdestruct);
                        msg = new message_1.default({
                            caller: this._env.address,
                            gasLimit: gasLimit,
                            value: value,
                            data: data,
                            salt: salt,
                            depth: this._env.depth + 1,
                            selfdestruct: selfdestruct,
                        });
                        // empty the return data buffer
                        this._lastReturned = Buffer.alloc(0);
                        // Check if account has enough ether and max depth not exceeded
                        if (this._env.depth >= this._common.param('vm', 'stackLimit') ||
                            (msg.delegatecall !== true && this._env.contract.balance.lt(msg.value))) {
                            return [2 /*return*/, new ethereumjs_util_1.BN(0)];
                        }
                        this._env.contract.nonce.iaddn(1);
                        return [4 /*yield*/, this._state.putAccount(this._env.address, this._env.contract)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._evm.executeMessage(msg)];
                    case 2:
                        results = _a.sent();
                        if (results.execResult.logs) {
                            this._result.logs = this._result.logs.concat(results.execResult.logs);
                        }
                        // this should always be safe
                        this.useGas(results.gasUsed, 'CREATE');
                        // Set return buffer in case revert happened
                        if (results.execResult.exceptionError &&
                            results.execResult.exceptionError.error === exceptions_1.ERROR.REVERT) {
                            this._lastReturned = results.execResult.returnValue;
                        }
                        if (!(!results.execResult.exceptionError ||
                            results.execResult.exceptionError.error === exceptions_1.ERROR.CODESTORE_OUT_OF_GAS)) return [3 /*break*/, 4];
                        Object.assign(this._result.selfdestruct, selfdestruct);
                        return [4 /*yield*/, this._state.getAccount(this._env.address)];
                    case 3:
                        account = _a.sent();
                        this._env.contract = account;
                        if (results.createdAddress) {
                            // push the created address to the stack
                            return [2 /*return*/, new ethereumjs_util_1.BN(results.createdAddress.buf)];
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, this._getReturnCode(results)];
                }
            });
        });
    };
    /**
     * Creates a new contract with a given value. Generates
     * a deterministic address via CREATE2 rules.
     */
    EEI.prototype.create2 = function (gasLimit, value, data, salt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.create(gasLimit, value, data, salt)];
            });
        });
    };
    /**
     * Returns true if account is empty or non-existent (according to EIP-161).
     * @param address - Address of account
     */
    EEI.prototype.isAccountEmpty = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._state.accountIsEmpty(address)];
            });
        });
    };
    /**
     * Returns true if account exists in the state trie (it can be empty). Returns false if the account is `null`.
     * @param address - Address of account
     */
    EEI.prototype.accountExists = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._state.accountExists(address)];
            });
        });
    };
    EEI.prototype._getReturnCode = function (results) {
        // This preserves the previous logic, but seems to contradict the EEI spec
        // https://github.com/ewasm/design/blob/38eeded28765f3e193e12881ea72a6ab807a3371/eth_interface.md
        if (results.execResult.exceptionError) {
            return new ethereumjs_util_1.BN(0);
        }
        else {
            return new ethereumjs_util_1.BN(1);
        }
    };
    return EEI;
}());
exports.default = EEI;
//# sourceMappingURL=eei.js.map
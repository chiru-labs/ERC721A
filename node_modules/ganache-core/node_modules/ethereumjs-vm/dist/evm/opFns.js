"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var utils = require("ethereumjs-util");
var exceptions_1 = require("../exceptions");
var MASK_160 = new BN(1).shln(160).subn(1);
// Find Ceil(`this` / `num`)
function divCeil(a, b) {
    var div = a.div(b);
    var mod = a.mod(b);
    // Fast case - exact division
    if (mod.isZero())
        return div;
    // Round up
    return div.isNeg() ? div.isubn(1) : div.iaddn(1);
}
function addressToBuffer(address) {
    return address.and(MASK_160).toArrayLike(Buffer, 'be', 20);
}
// the opcode functions
exports.handlers = {
    STOP: function (runState) {
        trap(exceptions_1.ERROR.STOP);
    },
    ADD: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = a.add(b).mod(utils.TWO_POW256);
        runState.stack.push(r);
    },
    MUL: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = a.mul(b).mod(utils.TWO_POW256);
        runState.stack.push(r);
    },
    SUB: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = a.sub(b).toTwos(256);
        runState.stack.push(r);
    },
    DIV: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            r = a.div(b);
        }
        runState.stack.push(r);
    },
    SDIV: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            a = a.fromTwos(256);
            b = b.fromTwos(256);
            r = a.div(b).toTwos(256);
        }
        runState.stack.push(r);
    },
    MOD: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            r = a.mod(b);
        }
        runState.stack.push(r);
    },
    SMOD: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            a = a.fromTwos(256);
            b = b.fromTwos(256);
            r = a.abs().mod(b.abs());
            if (a.isNeg()) {
                r = r.ineg();
            }
            r = r.toTwos(256);
        }
        runState.stack.push(r);
    },
    ADDMOD: function (runState) {
        var _a = runState.stack.popN(3), a = _a[0], b = _a[1], c = _a[2];
        var r;
        if (c.isZero()) {
            r = new BN(c);
        }
        else {
            r = a.add(b).mod(c);
        }
        runState.stack.push(r);
    },
    MULMOD: function (runState) {
        var _a = runState.stack.popN(3), a = _a[0], b = _a[1], c = _a[2];
        var r;
        if (c.isZero()) {
            r = new BN(c);
        }
        else {
            r = a.mul(b).mod(c);
        }
        runState.stack.push(r);
    },
    EXP: function (runState) {
        var _a = runState.stack.popN(2), base = _a[0], exponent = _a[1];
        if (exponent.isZero()) {
            runState.stack.push(new BN(1));
            return;
        }
        var byteLength = exponent.byteLength();
        if (byteLength < 1 || byteLength > 32) {
            trap(exceptions_1.ERROR.OUT_OF_RANGE);
        }
        var gasPrice = runState._common.param('gasPrices', 'expByte');
        var amount = new BN(byteLength).muln(gasPrice);
        runState.eei.useGas(amount);
        if (base.isZero()) {
            runState.stack.push(new BN(0));
            return;
        }
        var m = BN.red(utils.TWO_POW256);
        var redBase = base.toRed(m);
        var r = redBase.redPow(exponent);
        runState.stack.push(r.fromRed());
    },
    SIGNEXTEND: function (runState) {
        var _a = runState.stack.popN(2), k = _a[0], val = _a[1];
        if (k.ltn(31)) {
            var signBit = k
                .muln(8)
                .iaddn(7)
                .toNumber();
            var mask = new BN(1).ishln(signBit).isubn(1);
            if (val.testn(signBit)) {
                val = val.or(mask.notn(256));
            }
            else {
                val = val.and(mask);
            }
        }
        else {
            // return the same value
            val = new BN(val);
        }
        runState.stack.push(val);
    },
    // 0x10 range - bit ops
    LT: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = new BN(a.lt(b) ? 1 : 0);
        runState.stack.push(r);
    },
    GT: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = new BN(a.gt(b) ? 1 : 0);
        runState.stack.push(r);
    },
    SLT: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = new BN(a.fromTwos(256).lt(b.fromTwos(256)) ? 1 : 0);
        runState.stack.push(r);
    },
    SGT: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = new BN(a.fromTwos(256).gt(b.fromTwos(256)) ? 1 : 0);
        runState.stack.push(r);
    },
    EQ: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = new BN(a.eq(b) ? 1 : 0);
        runState.stack.push(r);
    },
    ISZERO: function (runState) {
        var a = runState.stack.pop();
        var r = new BN(a.isZero() ? 1 : 0);
        runState.stack.push(r);
    },
    AND: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = a.and(b);
        runState.stack.push(r);
    },
    OR: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = a.or(b);
        runState.stack.push(r);
    },
    XOR: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        var r = a.xor(b);
        runState.stack.push(r);
    },
    NOT: function (runState) {
        var a = runState.stack.pop();
        var r = a.notn(256);
        runState.stack.push(r);
    },
    BYTE: function (runState) {
        var _a = runState.stack.popN(2), pos = _a[0], word = _a[1];
        if (pos.gten(32)) {
            runState.stack.push(new BN(0));
            return;
        }
        var r = new BN(word.shrn((31 - pos.toNumber()) * 8).andln(0xff));
        runState.stack.push(r);
    },
    SHL: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        if (!runState._common.gteHardfork('constantinople')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        if (a.gten(256)) {
            runState.stack.push(new BN(0));
            return;
        }
        var r = b.shln(a.toNumber()).iand(utils.MAX_INTEGER);
        runState.stack.push(r);
    },
    SHR: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        if (!runState._common.gteHardfork('constantinople')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        if (a.gten(256)) {
            runState.stack.push(new BN(0));
            return;
        }
        var r = b.shrn(a.toNumber());
        runState.stack.push(r);
    },
    SAR: function (runState) {
        var _a = runState.stack.popN(2), a = _a[0], b = _a[1];
        if (!runState._common.gteHardfork('constantinople')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        var r;
        var isSigned = b.testn(255);
        if (a.gten(256)) {
            if (isSigned) {
                r = new BN(utils.MAX_INTEGER);
            }
            else {
                r = new BN(0);
            }
            runState.stack.push(r);
            return;
        }
        var c = b.shrn(a.toNumber());
        if (isSigned) {
            var shiftedOutWidth = 255 - a.toNumber();
            var mask = utils.MAX_INTEGER.shrn(shiftedOutWidth).shln(shiftedOutWidth);
            r = c.ior(mask);
        }
        else {
            r = c;
        }
        runState.stack.push(r);
    },
    // 0x20 range - crypto
    SHA3: function (runState) {
        var _a = runState.stack.popN(2), offset = _a[0], length = _a[1];
        subMemUsage(runState, offset, length);
        var data = Buffer.alloc(0);
        if (!length.isZero()) {
            data = runState.memory.read(offset.toNumber(), length.toNumber());
        }
        // copy fee
        runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sha3Word')).imul(divCeil(length, new BN(32))));
        var r = new BN(utils.keccak256(data));
        runState.stack.push(r);
    },
    // 0x30 range - closure state
    ADDRESS: function (runState) {
        runState.stack.push(new BN(runState.eei.getAddress()));
    },
    BALANCE: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var address, addressBuf, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = runState.stack.pop();
                        addressBuf = addressToBuffer(address);
                        return [4 /*yield*/, runState.eei.getExternalBalance(addressBuf)];
                    case 1:
                        balance = _a.sent();
                        runState.stack.push(balance);
                        return [2 /*return*/];
                }
            });
        });
    },
    ORIGIN: function (runState) {
        runState.stack.push(runState.eei.getTxOrigin());
    },
    CALLER: function (runState) {
        runState.stack.push(runState.eei.getCaller());
    },
    CALLVALUE: function (runState) {
        runState.stack.push(runState.eei.getCallValue());
    },
    CALLDATALOAD: function (runState) {
        var pos = runState.stack.pop();
        if (pos.gt(runState.eei.getCallDataSize())) {
            runState.stack.push(new BN(0));
            return;
        }
        var i = pos.toNumber();
        var loaded = runState.eei.getCallData().slice(i, i + 32);
        loaded = loaded.length ? loaded : Buffer.from([0]);
        var r = new BN(utils.setLengthRight(loaded, 32));
        runState.stack.push(r);
    },
    CALLDATASIZE: function (runState) {
        var r = runState.eei.getCallDataSize();
        runState.stack.push(r);
    },
    CALLDATACOPY: function (runState) {
        var _a = runState.stack.popN(3), memOffset = _a[0], dataOffset = _a[1], dataLength = _a[2];
        subMemUsage(runState, memOffset, dataLength);
        runState.eei.useGas(new BN(runState._common.param('gasPrices', 'copy')).imul(divCeil(dataLength, new BN(32))));
        var data = getDataSlice(runState.eei.getCallData(), dataOffset, dataLength);
        var memOffsetNum = memOffset.toNumber();
        var dataLengthNum = dataLength.toNumber();
        runState.memory.extend(memOffsetNum, dataLengthNum);
        runState.memory.write(memOffsetNum, dataLengthNum, data);
    },
    CODESIZE: function (runState) {
        runState.stack.push(runState.eei.getCodeSize());
    },
    CODECOPY: function (runState) {
        var _a = runState.stack.popN(3), memOffset = _a[0], codeOffset = _a[1], length = _a[2];
        subMemUsage(runState, memOffset, length);
        runState.eei.useGas(new BN(runState._common.param('gasPrices', 'copy')).imul(divCeil(length, new BN(32))));
        var data = getDataSlice(runState.eei.getCode(), codeOffset, length);
        var memOffsetNum = memOffset.toNumber();
        var lengthNum = length.toNumber();
        runState.memory.extend(memOffsetNum, lengthNum);
        runState.memory.write(memOffsetNum, lengthNum, data);
    },
    EXTCODESIZE: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var address, size;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = runState.stack.pop();
                        return [4 /*yield*/, runState.eei.getExternalCodeSize(address)];
                    case 1:
                        size = _a.sent();
                        runState.stack.push(size);
                        return [2 /*return*/];
                }
            });
        });
    },
    EXTCODECOPY: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, address, memOffset, codeOffset, length, code, data, memOffsetNum, lengthNum;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = runState.stack.popN(4), address = _a[0], memOffset = _a[1], codeOffset = _a[2], length = _a[3];
                        // FIXME: for some reason this must come before subGas
                        subMemUsage(runState, memOffset, length);
                        // copy fee
                        runState.eei.useGas(new BN(runState._common.param('gasPrices', 'copy')).imul(divCeil(length, new BN(32))));
                        return [4 /*yield*/, runState.eei.getExternalCode(address)];
                    case 1:
                        code = _b.sent();
                        data = getDataSlice(code, codeOffset, length);
                        memOffsetNum = memOffset.toNumber();
                        lengthNum = length.toNumber();
                        runState.memory.extend(memOffsetNum, lengthNum);
                        runState.memory.write(memOffsetNum, lengthNum, data);
                        return [2 /*return*/];
                }
            });
        });
    },
    EXTCODEHASH: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var address, addressBuf, empty, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = runState.stack.pop();
                        if (!runState._common.gteHardfork('constantinople')) {
                            trap(exceptions_1.ERROR.INVALID_OPCODE);
                        }
                        addressBuf = addressToBuffer(address);
                        return [4 /*yield*/, runState.eei.isAccountEmpty(addressBuf)];
                    case 1:
                        empty = _a.sent();
                        if (empty) {
                            runState.stack.push(new BN(0));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, runState.eei.getExternalCode(address)];
                    case 2:
                        code = _a.sent();
                        if (code.length === 0) {
                            runState.stack.push(new BN(utils.KECCAK256_NULL));
                            return [2 /*return*/];
                        }
                        runState.stack.push(new BN(utils.keccak256(code)));
                        return [2 /*return*/];
                }
            });
        });
    },
    RETURNDATASIZE: function (runState) {
        runState.stack.push(runState.eei.getReturnDataSize());
    },
    RETURNDATACOPY: function (runState) {
        var _a = runState.stack.popN(3), memOffset = _a[0], returnDataOffset = _a[1], length = _a[2];
        if (returnDataOffset.add(length).gt(runState.eei.getReturnDataSize())) {
            trap(exceptions_1.ERROR.OUT_OF_GAS);
        }
        subMemUsage(runState, memOffset, length);
        runState.eei.useGas(new BN(runState._common.param('gasPrices', 'copy')).mul(divCeil(length, new BN(32))));
        var data = getDataSlice(runState.eei.getReturnData(), returnDataOffset, length);
        var memOffsetNum = memOffset.toNumber();
        var lengthNum = length.toNumber();
        runState.memory.extend(memOffsetNum, lengthNum);
        runState.memory.write(memOffsetNum, lengthNum, data);
    },
    GASPRICE: function (runState) {
        runState.stack.push(runState.eei.getTxGasPrice());
    },
    // '0x40' range - block operations
    BLOCKHASH: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var number, diff, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        number = runState.stack.pop();
                        diff = runState.eei.getBlockNumber().sub(number);
                        // block lookups must be within the past 256 blocks
                        if (diff.gtn(256) || diff.lten(0)) {
                            runState.stack.push(new BN(0));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, runState.eei.getBlockHash(number)];
                    case 1:
                        hash = _a.sent();
                        runState.stack.push(hash);
                        return [2 /*return*/];
                }
            });
        });
    },
    COINBASE: function (runState) {
        runState.stack.push(runState.eei.getBlockCoinbase());
    },
    TIMESTAMP: function (runState) {
        runState.stack.push(runState.eei.getBlockTimestamp());
    },
    NUMBER: function (runState) {
        runState.stack.push(runState.eei.getBlockNumber());
    },
    DIFFICULTY: function (runState) {
        runState.stack.push(runState.eei.getBlockDifficulty());
    },
    GASLIMIT: function (runState) {
        runState.stack.push(runState.eei.getBlockGasLimit());
    },
    CHAINID: function (runState) {
        if (!runState._common.gteHardfork('istanbul')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        runState.stack.push(runState.eei.getChainId());
    },
    SELFBALANCE: function (runState) {
        if (!runState._common.gteHardfork('istanbul')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        runState.stack.push(runState.eei.getSelfBalance());
    },
    // 0x50 range - 'storage' and execution
    POP: function (runState) {
        runState.stack.pop();
    },
    MLOAD: function (runState) {
        var pos = runState.stack.pop();
        subMemUsage(runState, pos, new BN(32));
        var word = runState.memory.read(pos.toNumber(), 32);
        runState.stack.push(new BN(word));
    },
    MSTORE: function (runState) {
        var _a = runState.stack.popN(2), offset = _a[0], word = _a[1];
        var buf = word.toArrayLike(Buffer, 'be', 32);
        subMemUsage(runState, offset, new BN(32));
        var offsetNum = offset.toNumber();
        runState.memory.extend(offsetNum, 32);
        runState.memory.write(offsetNum, 32, buf);
    },
    MSTORE8: function (runState) {
        var _a = runState.stack.popN(2), offset = _a[0], byte = _a[1];
        // NOTE: we're using a 'trick' here to get the least significant byte
        // NOTE: force cast necessary because `BN.andln` returns number but
        // the types are wrong
        var buf = Buffer.from([byte.andln(0xff)]);
        subMemUsage(runState, offset, new BN(1));
        var offsetNum = offset.toNumber();
        runState.memory.extend(offsetNum, 1);
        runState.memory.write(offsetNum, 1, buf);
    },
    SLOAD: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var key, keyBuf, value, valueBN;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = runState.stack.pop();
                        keyBuf = key.toArrayLike(Buffer, 'be', 32);
                        return [4 /*yield*/, runState.eei.storageLoad(keyBuf)];
                    case 1:
                        value = _a.sent();
                        valueBN = value.length ? new BN(value) : new BN(0);
                        runState.stack.push(valueBN);
                        return [2 /*return*/];
                }
            });
        });
    },
    SSTORE: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, key, val, keyBuf, value, found;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (runState.eei.isStatic()) {
                            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                        }
                        _a = runState.stack.popN(2), key = _a[0], val = _a[1];
                        keyBuf = key.toArrayLike(Buffer, 'be', 32);
                        if (val.isZero()) {
                            value = Buffer.from([]);
                        }
                        else {
                            value = val.toArrayLike(Buffer, 'be');
                        }
                        return [4 /*yield*/, getContractStorage(runState, runState.eei.getAddress(), keyBuf)];
                    case 1:
                        found = _b.sent();
                        updateSstoreGas(runState, found, value);
                        return [4 /*yield*/, runState.eei.storageStore(keyBuf, value)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    JUMP: function (runState) {
        var dest = runState.stack.pop();
        if (dest.gt(runState.eei.getCodeSize())) {
            trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
        }
        var destNum = dest.toNumber();
        if (!jumpIsValid(runState, destNum)) {
            trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
        }
        runState.programCounter = destNum;
    },
    JUMPI: function (runState) {
        var _a = runState.stack.popN(2), dest = _a[0], cond = _a[1];
        if (!cond.isZero()) {
            if (dest.gt(runState.eei.getCodeSize())) {
                trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
            }
            var destNum = dest.toNumber();
            if (!jumpIsValid(runState, destNum)) {
                trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
            }
            runState.programCounter = destNum;
        }
    },
    PC: function (runState) {
        runState.stack.push(new BN(runState.programCounter - 1));
    },
    MSIZE: function (runState) {
        runState.stack.push(runState.memoryWordCount.muln(32));
    },
    GAS: function (runState) {
        runState.stack.push(new BN(runState.eei.getGasLeft()));
    },
    JUMPDEST: function (runState) { },
    PUSH: function (runState) {
        var numToPush = runState.opCode - 0x5f;
        var loaded = new BN(runState.eei
            .getCode()
            .slice(runState.programCounter, runState.programCounter + numToPush)
            .toString('hex'), 16);
        runState.programCounter += numToPush;
        runState.stack.push(loaded);
    },
    DUP: function (runState) {
        var stackPos = runState.opCode - 0x7f;
        runState.stack.dup(stackPos);
    },
    SWAP: function (runState) {
        var stackPos = runState.opCode - 0x8f;
        runState.stack.swap(stackPos);
    },
    LOG: function (runState) {
        if (runState.eei.isStatic()) {
            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
        }
        var _a = runState.stack.popN(2), memOffset = _a[0], memLength = _a[1];
        var topicsCount = runState.opCode - 0xa0;
        if (topicsCount < 0 || topicsCount > 4) {
            trap(exceptions_1.ERROR.OUT_OF_RANGE);
        }
        var topics = runState.stack.popN(topicsCount);
        var topicsBuf = topics.map(function (a) {
            return a.toArrayLike(Buffer, 'be', 32);
        });
        subMemUsage(runState, memOffset, memLength);
        var mem = Buffer.alloc(0);
        if (!memLength.isZero()) {
            mem = runState.memory.read(memOffset.toNumber(), memLength.toNumber());
        }
        runState.eei.useGas(new BN(runState._common.param('gasPrices', 'logTopic'))
            .imuln(topicsCount)
            .iadd(memLength.muln(runState._common.param('gasPrices', 'logData'))));
        runState.eei.log(mem, topicsCount, topicsBuf);
    },
    // '0xf0' range - closures
    CREATE: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, value, offset, length, gasLimit, data, ret;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (runState.eei.isStatic()) {
                            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                        }
                        _a = runState.stack.popN(3), value = _a[0], offset = _a[1], length = _a[2];
                        subMemUsage(runState, offset, length);
                        gasLimit = new BN(runState.eei.getGasLeft());
                        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
                        data = Buffer.alloc(0);
                        if (!length.isZero()) {
                            data = runState.memory.read(offset.toNumber(), length.toNumber());
                        }
                        return [4 /*yield*/, runState.eei.create(gasLimit, value, data)];
                    case 1:
                        ret = _b.sent();
                        runState.stack.push(ret);
                        return [2 /*return*/];
                }
            });
        });
    },
    CREATE2: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, value, offset, length, salt, gasLimit, data, ret;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!runState._common.gteHardfork('constantinople')) {
                            trap(exceptions_1.ERROR.INVALID_OPCODE);
                        }
                        if (runState.eei.isStatic()) {
                            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                        }
                        _a = runState.stack.popN(4), value = _a[0], offset = _a[1], length = _a[2], salt = _a[3];
                        subMemUsage(runState, offset, length);
                        // Deduct gas costs for hashing
                        runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sha3Word')).imul(divCeil(length, new BN(32))));
                        gasLimit = new BN(runState.eei.getGasLeft());
                        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
                        data = Buffer.alloc(0);
                        if (!length.isZero()) {
                            data = runState.memory.read(offset.toNumber(), length.toNumber());
                        }
                        return [4 /*yield*/, runState.eei.create2(gasLimit, value, data, salt.toArrayLike(Buffer, 'be', 32))];
                    case 1:
                        ret = _b.sent();
                        runState.stack.push(ret);
                        return [2 /*return*/];
                }
            });
        });
    },
    CALL: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gasLimit, toAddress, value, inOffset, inLength, outOffset, outLength, toAddressBuf, data, empty, ret;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = runState.stack.popN(7), gasLimit = _a[0], toAddress = _a[1], value = _a[2], inOffset = _a[3], inLength = _a[4], outOffset = _a[5], outLength = _a[6];
                        toAddressBuf = addressToBuffer(toAddress);
                        if (runState.eei.isStatic() && !value.isZero()) {
                            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                        }
                        subMemUsage(runState, inOffset, inLength);
                        subMemUsage(runState, outOffset, outLength);
                        if (!value.isZero()) {
                            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'callValueTransfer')));
                        }
                        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
                        data = Buffer.alloc(0);
                        if (!inLength.isZero()) {
                            data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                        }
                        return [4 /*yield*/, runState.eei.isAccountEmpty(toAddressBuf)];
                    case 1:
                        empty = _b.sent();
                        if (empty) {
                            if (!value.isZero()) {
                                runState.eei.useGas(new BN(runState._common.param('gasPrices', 'callNewAccount')));
                            }
                        }
                        if (!value.isZero()) {
                            // TODO: Don't use private attr directly
                            runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'));
                            gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'));
                        }
                        return [4 /*yield*/, runState.eei.call(gasLimit, toAddressBuf, value, data)
                            // Write return data to memory
                        ];
                    case 2:
                        ret = _b.sent();
                        // Write return data to memory
                        writeCallOutput(runState, outOffset, outLength);
                        runState.stack.push(ret);
                        return [2 /*return*/];
                }
            });
        });
    },
    CALLCODE: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gasLimit, toAddress, value, inOffset, inLength, outOffset, outLength, toAddressBuf, data, ret;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = runState.stack.popN(7), gasLimit = _a[0], toAddress = _a[1], value = _a[2], inOffset = _a[3], inLength = _a[4], outOffset = _a[5], outLength = _a[6];
                        toAddressBuf = addressToBuffer(toAddress);
                        subMemUsage(runState, inOffset, inLength);
                        subMemUsage(runState, outOffset, outLength);
                        if (!value.isZero()) {
                            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'callValueTransfer')));
                        }
                        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
                        if (!value.isZero()) {
                            // TODO: Don't use private attr directly
                            runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'));
                            gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'));
                        }
                        data = Buffer.alloc(0);
                        if (!inLength.isZero()) {
                            data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                        }
                        return [4 /*yield*/, runState.eei.callCode(gasLimit, toAddressBuf, value, data)
                            // Write return data to memory
                        ];
                    case 1:
                        ret = _b.sent();
                        // Write return data to memory
                        writeCallOutput(runState, outOffset, outLength);
                        runState.stack.push(ret);
                        return [2 /*return*/];
                }
            });
        });
    },
    DELEGATECALL: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var value, _a, gasLimit, toAddress, inOffset, inLength, outOffset, outLength, toAddressBuf, data, ret;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        value = runState.eei.getCallValue();
                        _a = runState.stack.popN(6), gasLimit = _a[0], toAddress = _a[1], inOffset = _a[2], inLength = _a[3], outOffset = _a[4], outLength = _a[5];
                        toAddressBuf = addressToBuffer(toAddress);
                        subMemUsage(runState, inOffset, inLength);
                        subMemUsage(runState, outOffset, outLength);
                        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
                        data = Buffer.alloc(0);
                        if (!inLength.isZero()) {
                            data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                        }
                        return [4 /*yield*/, runState.eei.callDelegate(gasLimit, toAddressBuf, value, data)
                            // Write return data to memory
                        ];
                    case 1:
                        ret = _b.sent();
                        // Write return data to memory
                        writeCallOutput(runState, outOffset, outLength);
                        runState.stack.push(ret);
                        return [2 /*return*/];
                }
            });
        });
    },
    STATICCALL: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var value, _a, gasLimit, toAddress, inOffset, inLength, outOffset, outLength, toAddressBuf, data, ret;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        value = new BN(0);
                        _a = runState.stack.popN(6), gasLimit = _a[0], toAddress = _a[1], inOffset = _a[2], inLength = _a[3], outOffset = _a[4], outLength = _a[5];
                        toAddressBuf = addressToBuffer(toAddress);
                        subMemUsage(runState, inOffset, inLength);
                        subMemUsage(runState, outOffset, outLength);
                        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
                        data = Buffer.alloc(0);
                        if (!inLength.isZero()) {
                            data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
                        }
                        return [4 /*yield*/, runState.eei.callStatic(gasLimit, toAddressBuf, value, data)
                            // Write return data to memory
                        ];
                    case 1:
                        ret = _b.sent();
                        // Write return data to memory
                        writeCallOutput(runState, outOffset, outLength);
                        runState.stack.push(ret);
                        return [2 /*return*/];
                }
            });
        });
    },
    RETURN: function (runState) {
        var _a = runState.stack.popN(2), offset = _a[0], length = _a[1];
        subMemUsage(runState, offset, length);
        var returnData = Buffer.alloc(0);
        if (!length.isZero()) {
            returnData = runState.memory.read(offset.toNumber(), length.toNumber());
        }
        runState.eei.finish(returnData);
    },
    REVERT: function (runState) {
        var _a = runState.stack.popN(2), offset = _a[0], length = _a[1];
        subMemUsage(runState, offset, length);
        var returnData = Buffer.alloc(0);
        if (!length.isZero()) {
            returnData = runState.memory.read(offset.toNumber(), length.toNumber());
        }
        runState.eei.revert(returnData);
    },
    // '0x70', range - other
    SELFDESTRUCT: function (runState) {
        return __awaiter(this, void 0, void 0, function () {
            var selfdestructToAddress, selfdestructToAddressBuf, balance, empty;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        selfdestructToAddress = runState.stack.pop();
                        if (runState.eei.isStatic()) {
                            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
                        }
                        selfdestructToAddressBuf = addressToBuffer(selfdestructToAddress);
                        return [4 /*yield*/, runState.eei.getExternalBalance(runState.eei.getAddress())];
                    case 1:
                        balance = _a.sent();
                        if (!balance.gtn(0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, runState.eei.isAccountEmpty(selfdestructToAddressBuf)];
                    case 2:
                        empty = _a.sent();
                        if (empty) {
                            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'callNewAccount')));
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, runState.eei.selfDestruct(selfdestructToAddressBuf)];
                }
            });
        });
    },
};
function describeLocation(runState) {
    var hash = utils.keccak256(runState.eei.getCode()).toString('hex');
    var address = runState.eei.getAddress().toString('hex');
    var pc = runState.programCounter - 1;
    return hash + '/' + address + ':' + pc;
}
function trap(err) {
    // TODO: facilitate extra data along with errors
    throw new exceptions_1.VmError(err);
}
/**
 * Subtracts the amount needed for memory usage from `runState.gasLeft`
 * @method subMemUsage
 * @param {Object} runState
 * @param {BN} offset
 * @param {BN} length
 * @returns {String}
 */
function subMemUsage(runState, offset, length) {
    // YP (225): access with zero length will not extend the memory
    if (length.isZero())
        return;
    var newMemoryWordCount = divCeil(offset.add(length), new BN(32));
    if (newMemoryWordCount.lte(runState.memoryWordCount))
        return;
    var words = newMemoryWordCount;
    var fee = new BN(runState._common.param('gasPrices', 'memory'));
    var quadCoeff = new BN(runState._common.param('gasPrices', 'quadCoeffDiv'));
    // words * 3 + words ^2 / 512
    var cost = words.mul(fee).add(words.mul(words).div(quadCoeff));
    if (cost.gt(runState.highestMemCost)) {
        runState.eei.useGas(cost.sub(runState.highestMemCost));
        runState.highestMemCost = cost;
    }
    runState.memoryWordCount = newMemoryWordCount;
}
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 * @param {BN} offset
 * @param {BN} length
 * @param {Buffer} data
 */
function getDataSlice(data, offset, length) {
    var len = new BN(data.length);
    if (offset.gt(len)) {
        offset = len;
    }
    var end = offset.add(length);
    if (end.gt(len)) {
        end = len;
    }
    data = data.slice(offset.toNumber(), end.toNumber());
    // Right-pad with zeros to fill dataLength bytes
    data = utils.setLengthRight(data, length.toNumber());
    return data;
}
// checks if a jump is valid given a destination
function jumpIsValid(runState, dest) {
    return runState.validJumps.indexOf(dest) !== -1;
}
function maxCallGas(gasLimit, gasLeft) {
    var gasAllowed = gasLeft.sub(gasLeft.divn(64));
    return gasLimit.gt(gasAllowed) ? gasAllowed : gasLimit;
}
function getContractStorage(runState, address, key) {
    return new Promise(function (resolve, reject) {
        var cb = function (err, res) {
            if (err)
                return reject(err);
            resolve(res);
        };
        runState.stateManager.getContractStorage(address, key, function (err, current) {
            if (err)
                return cb(err, null);
            if (runState._common.hardfork() === 'constantinople' ||
                runState._common.gteHardfork('istanbul')) {
                runState.stateManager.getOriginalContractStorage(address, key, function (err, original) {
                    if (err)
                        return cb(err, null);
                    cb(null, { current: current, original: original });
                });
            }
            else {
                cb(null, current);
            }
        });
    });
}
function updateSstoreGas(runState, found, value) {
    if (runState._common.hardfork() === 'constantinople') {
        var original = found.original;
        var current = found.current;
        if (current.equals(value)) {
            // If current value equals new value (this is a no-op), 200 gas is deducted.
            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'netSstoreNoopGas')));
            return;
        }
        // If current value does not equal new value
        if (original.equals(current)) {
            // If original value equals current value (this storage slot has not been changed by the current execution context)
            if (original.length === 0) {
                // If original value is 0, 20000 gas is deducted.
                return runState.eei.useGas(new BN(runState._common.param('gasPrices', 'netSstoreInitGas')));
            }
            if (value.length === 0) {
                // If new value is 0, add 15000 gas to refund counter.
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'netSstoreClearRefund')));
            }
            // Otherwise, 5000 gas is deducted.
            return runState.eei.useGas(new BN(runState._common.param('gasPrices', 'netSstoreCleanGas')));
        }
        // If original value does not equal current value (this storage slot is dirty), 200 gas is deducted. Apply both of the following clauses.
        if (original.length !== 0) {
            // If original value is not 0
            if (current.length === 0) {
                // If current value is 0 (also means that new value is not 0), remove 15000 gas from refund counter. We can prove that refund counter will never go below 0.
                runState.eei.subRefund(new BN(runState._common.param('gasPrices', 'netSstoreClearRefund')));
            }
            else if (value.length === 0) {
                // If new value is 0 (also means that current value is not 0), add 15000 gas to refund counter.
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'netSstoreClearRefund')));
            }
        }
        if (original.equals(value)) {
            // If original value equals new value (this storage slot is reset)
            if (original.length === 0) {
                // If original value is 0, add 19800 gas to refund counter.
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'netSstoreResetClearRefund')));
            }
            else {
                // Otherwise, add 4800 gas to refund counter.
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'netSstoreResetRefund')));
            }
        }
        return runState.eei.useGas(new BN(runState._common.param('gasPrices', 'netSstoreDirtyGas')));
    }
    else if (runState._common.gteHardfork('istanbul')) {
        // EIP-2200
        var original_1 = found.original;
        var current_1 = found.current;
        // Fail if not enough gas is left
        if (runState.eei.getGasLeft().lten(runState._common.param('gasPrices', 'sstoreSentryGasEIP2200'))) {
            trap(exceptions_1.ERROR.OUT_OF_GAS);
        }
        // Noop
        if (current_1.equals(value)) {
            return runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreNoopGasEIP2200')));
        }
        if (original_1.equals(current_1)) {
            // Create slot
            if (original_1.length === 0) {
                return runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreInitGasEIP2200')));
            }
            // Delete slot
            if (value.length === 0) {
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'sstoreClearRefundEIP2200')));
            }
            // Write existing slot
            return runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreCleanGasEIP2200')));
        }
        if (original_1.length > 0) {
            if (current_1.length === 0) {
                // Recreate slot
                runState.eei.subRefund(new BN(runState._common.param('gasPrices', 'sstoreClearRefundEIP2200')));
            }
            else if (value.length === 0) {
                // Delete slot
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'sstoreClearRefundEIP2200')));
            }
        }
        if (original_1.equals(value)) {
            if (original_1.length === 0) {
                // Reset to original non-existent slot
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'sstoreInitRefundEIP2200')));
            }
            else {
                // Reset to original existing slot
                runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'sstoreCleanRefundEIP2200')));
            }
        }
        // Dirty update
        return runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreDirtyGasEIP2200')));
    }
    else {
        if (value.length === 0 && !found.length) {
            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreReset')));
        }
        else if (value.length === 0 && found.length) {
            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreReset')));
            runState.eei.refundGas(new BN(runState._common.param('gasPrices', 'sstoreRefund')));
        }
        else if (value.length !== 0 && !found.length) {
            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreSet')));
        }
        else if (value.length !== 0 && found.length) {
            runState.eei.useGas(new BN(runState._common.param('gasPrices', 'sstoreReset')));
        }
    }
}
function writeCallOutput(runState, outOffset, outLength) {
    var returnData = runState.eei.getReturnData();
    if (returnData.length > 0) {
        var memOffset = outOffset.toNumber();
        var dataLength = outLength.toNumber();
        if (returnData.length < dataLength) {
            dataLength = returnData.length;
        }
        var data = getDataSlice(returnData, new BN(0), new BN(dataLength));
        runState.memory.extend(memOffset, dataLength);
        runState.memory.write(memOffset, dataLength, data);
    }
}
//# sourceMappingURL=opFns.js.map
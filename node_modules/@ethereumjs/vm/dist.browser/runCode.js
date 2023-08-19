"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*

This is the core of the Ethereum Virtual Machine (EVM or just VM).

NOTES:

1. Stack items are lazily duplicated, so you must never directly change a buffer
from the stack, instead you should `copy` it first.

2. Not all stack items are 32 bytes, so if the operation relies on the stack
item length then you must use `utils.pad(<item>, 32)` first.

*/
var ethereumjs_util_1 = require("ethereumjs-util");
var block_1 = require("@ethereumjs/block");
var txContext_1 = __importDefault(require("./evm/txContext"));
var message_1 = __importDefault(require("./evm/message"));
var evm_1 = __importDefault(require("./evm/evm"));
/**
 * @ignore
 */
function runCode(opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var block = (_a = opts.block) !== null && _a !== void 0 ? _a : block_1.Block.fromBlockData({}, { common: this._common });
    // Backwards compatibility
    var txContext = (_b = opts.txContext) !== null && _b !== void 0 ? _b : new txContext_1.default((_c = opts.gasPrice) !== null && _c !== void 0 ? _c : new ethereumjs_util_1.BN(0), (_e = (_d = opts.origin) !== null && _d !== void 0 ? _d : opts.caller) !== null && _e !== void 0 ? _e : ethereumjs_util_1.Address.zero());
    var message = (_f = opts.message) !== null && _f !== void 0 ? _f : new message_1.default({
        code: opts.code,
        data: opts.data,
        gasLimit: opts.gasLimit,
        to: (_g = opts.address) !== null && _g !== void 0 ? _g : ethereumjs_util_1.Address.zero(),
        caller: opts.caller,
        value: opts.value,
        depth: (_h = opts.depth) !== null && _h !== void 0 ? _h : 0,
        selfdestruct: (_j = opts.selfdestruct) !== null && _j !== void 0 ? _j : {},
        isStatic: (_k = opts.isStatic) !== null && _k !== void 0 ? _k : false,
    });
    var evm = (_l = opts.evm) !== null && _l !== void 0 ? _l : new evm_1.default(this, txContext, block);
    return evm.runInterpreter(message, { pc: opts.pc });
}
exports.default = runCode;
//# sourceMappingURL=runCode.js.map
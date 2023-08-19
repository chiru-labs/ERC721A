"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ethereumjs_util_1 = require("ethereumjs-util");
var _a = require('../exceptions'), ERROR = _a.ERROR, VmError = _a.VmError;
/**
 * Implementation of the stack used in evm.
 */
var Stack = /** @class */ (function () {
    function Stack() {
        this._store = [];
    }
    Object.defineProperty(Stack.prototype, "length", {
        get: function () {
            return this._store.length;
        },
        enumerable: true,
        configurable: true
    });
    Stack.prototype.push = function (value) {
        if (!BN.isBN(value)) {
            throw new VmError(ERROR.INTERNAL_ERROR);
        }
        if (value.gt(ethereumjs_util_1.MAX_INTEGER)) {
            throw new VmError(ERROR.OUT_OF_RANGE);
        }
        if (this._store.length > 1023) {
            throw new VmError(ERROR.STACK_OVERFLOW);
        }
        this._store.push(value);
    };
    Stack.prototype.pop = function () {
        if (this._store.length < 1) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        // Length is checked above, so pop shouldn't return undefined
        return this._store.pop();
    };
    /**
     * Pop multiple items from stack. Top of stack is first item
     * in returned array.
     * @param num - Number of items to pop
     */
    Stack.prototype.popN = function (num) {
        if (num === void 0) { num = 1; }
        if (this._store.length < num) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        if (num === 0) {
            return [];
        }
        return this._store.splice(-1 * num).reverse();
    };
    /**
     * Swap top of stack with an item in the stack.
     * @param position - Index of item from top of the stack (0-indexed)
     */
    Stack.prototype.swap = function (position) {
        if (this._store.length <= position) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        var head = this._store.length - 1;
        var i = this._store.length - position - 1;
        var tmp = this._store[head];
        this._store[head] = this._store[i];
        this._store[i] = tmp;
    };
    /**
     * Pushes a copy of an item in the stack.
     * @param position - Index of item to be copied (1-indexed)
     */
    Stack.prototype.dup = function (position) {
        if (this._store.length < position) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        var i = this._store.length - position;
        this.push(this._store[i].clone());
    };
    return Stack;
}());
exports.default = Stack;
//# sourceMappingURL=stack.js.map
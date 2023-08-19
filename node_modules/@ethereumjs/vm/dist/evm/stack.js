"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const { ERROR, VmError } = require('../exceptions');
/**
 * Implementation of the stack used in evm.
 */
class Stack {
    constructor(maxHeight) {
        this._store = [];
        this._maxHeight = maxHeight !== null && maxHeight !== void 0 ? maxHeight : 1024;
    }
    get length() {
        return this._store.length;
    }
    push(value) {
        if (!ethereumjs_util_1.BN.isBN(value)) {
            throw new VmError(ERROR.INTERNAL_ERROR);
        }
        if (value.gt(ethereumjs_util_1.MAX_INTEGER)) {
            throw new VmError(ERROR.OUT_OF_RANGE);
        }
        if (this._store.length >= this._maxHeight) {
            throw new VmError(ERROR.STACK_OVERFLOW);
        }
        this._store.push(value);
    }
    pop() {
        if (this._store.length < 1) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        // Length is checked above, so pop shouldn't return undefined
        return this._store.pop();
    }
    /**
     * Pop multiple items from stack. Top of stack is first item
     * in returned array.
     * @param num - Number of items to pop
     */
    popN(num = 1) {
        if (this._store.length < num) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        if (num === 0) {
            return [];
        }
        return this._store.splice(-1 * num).reverse();
    }
    /**
     * Swap top of stack with an item in the stack.
     * @param position - Index of item from top of the stack (0-indexed)
     */
    swap(position) {
        if (this._store.length <= position) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        const head = this._store.length - 1;
        const i = this._store.length - position - 1;
        const tmp = this._store[head];
        this._store[head] = this._store[i];
        this._store[i] = tmp;
    }
    /**
     * Pushes a copy of an item in the stack.
     * @param position - Index of item to be copied (1-indexed)
     */
    dup(position) {
        if (this._store.length < position) {
            throw new VmError(ERROR.STACK_UNDERFLOW);
        }
        const i = this._store.length - position;
        this.push(this._store[i].clone());
    }
}
exports.default = Stack;
//# sourceMappingURL=stack.js.map
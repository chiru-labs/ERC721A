"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
/**
 * Memory implements a simple memory model
 * for the ethereum virtual machine.
 */
var Memory = /** @class */ (function () {
    function Memory() {
        this._store = [];
    }
    /**
     * Extends the memory given an offset and size. Rounds extended
     * memory to word-size.
     */
    Memory.prototype.extend = function (offset, size) {
        if (size === 0) {
            return;
        }
        var newSize = ceil(offset + size, 32);
        var sizeDiff = newSize - this._store.length;
        if (sizeDiff > 0) {
            this._store = this._store.concat(new Array(sizeDiff).fill(0));
        }
    };
    /**
     * Writes a byte array with length `size` to memory, starting from `offset`.
     * @param offset - Starting position
     * @param size - How many bytes to write
     * @param value - Value
     */
    Memory.prototype.write = function (offset, size, value) {
        if (size === 0) {
            return;
        }
        assert(value.length === size, 'Invalid value size');
        assert(offset + size <= this._store.length, 'Value exceeds memory capacity');
        assert(Buffer.isBuffer(value), 'Invalid value type');
        for (var i = 0; i < size; i++) {
            this._store[offset + i] = value[i];
        }
    };
    /**
     * Reads a slice of memory from `offset` till `offset + size` as a `Buffer`.
     * It fills up the difference between memory's length and `offset + size` with zeros.
     * @param offset - Starting position
     * @param size - How many bytes to read
     */
    Memory.prototype.read = function (offset, size) {
        var loaded = this._store.slice(offset, offset + size);
        // Fill the remaining length with zeros
        for (var i = loaded.length; i < size; i++) {
            loaded[i] = 0;
        }
        return Buffer.from(loaded);
    };
    return Memory;
}());
exports.default = Memory;
var ceil = function (value, ceiling) {
    var r = value % ceiling;
    if (r === 0) {
        return value;
    }
    else {
        return value + ceiling - r;
    }
};
//# sourceMappingURL=memory.js.map
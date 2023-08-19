"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const ethereumjs_util_1 = require("ethereumjs-util");
const BYTE_SIZE = 256;
class Bloom {
    /**
     * Represents a Bloom filter.
     */
    constructor(bitvector) {
        if (!bitvector) {
            this.bitvector = (0, ethereumjs_util_1.zeros)(BYTE_SIZE);
        }
        else {
            (0, assert_1.default)(bitvector.length === BYTE_SIZE, 'bitvectors must be 2048 bits long');
            this.bitvector = bitvector;
        }
    }
    /**
     * Adds an element to a bit vector of a 64 byte bloom filter.
     * @param e - The element to add
     */
    add(e) {
        (0, assert_1.default)(Buffer.isBuffer(e), 'Element should be buffer');
        e = (0, ethereumjs_util_1.keccak256)(e);
        const mask = 2047; // binary 11111111111
        for (let i = 0; i < 3; i++) {
            const first2bytes = e.readUInt16BE(i * 2);
            const loc = mask & first2bytes;
            const byteLoc = loc >> 3;
            const bitLoc = 1 << loc % 8;
            this.bitvector[BYTE_SIZE - byteLoc - 1] |= bitLoc;
        }
    }
    /**
     * Checks if an element is in the bloom.
     * @param e - The element to check
     */
    check(e) {
        (0, assert_1.default)(Buffer.isBuffer(e), 'Element should be Buffer');
        e = (0, ethereumjs_util_1.keccak256)(e);
        const mask = 2047; // binary 11111111111
        let match = true;
        for (let i = 0; i < 3 && match; i++) {
            const first2bytes = e.readUInt16BE(i * 2);
            const loc = mask & first2bytes;
            const byteLoc = loc >> 3;
            const bitLoc = 1 << loc % 8;
            match = (this.bitvector[BYTE_SIZE - byteLoc - 1] & bitLoc) !== 0;
        }
        return Boolean(match);
    }
    /**
     * Checks if multiple topics are in a bloom.
     * @returns `true` if every topic is in the bloom
     */
    multiCheck(topics) {
        return topics.every((t) => this.check(t));
    }
    /**
     * Bitwise or blooms together.
     */
    or(bloom) {
        if (bloom) {
            for (let i = 0; i <= BYTE_SIZE; i++) {
                this.bitvector[i] = this.bitvector[i] | bloom.bitvector[i];
            }
        }
    }
}
exports.default = Bloom;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var ethereumjs_util_1 = require("ethereumjs-util");
var BYTE_SIZE = 256;
var Bloom = /** @class */ (function () {
    /**
     * Represents a Bloom filter.
     */
    function Bloom(bitvector) {
        if (!bitvector) {
            this.bitvector = ethereumjs_util_1.zeros(BYTE_SIZE);
        }
        else {
            assert(bitvector.length === BYTE_SIZE, 'bitvectors must be 2048 bits long');
            this.bitvector = bitvector;
        }
    }
    /**
     * Adds an element to a bit vector of a 64 byte bloom filter.
     * @param e - The element to add
     */
    Bloom.prototype.add = function (e) {
        assert(Buffer.isBuffer(e), 'Element should be buffer');
        e = ethereumjs_util_1.keccak256(e);
        var mask = 2047; // binary 11111111111
        for (var i = 0; i < 3; i++) {
            var first2bytes = e.readUInt16BE(i * 2);
            var loc = mask & first2bytes;
            var byteLoc = loc >> 3;
            var bitLoc = 1 << loc % 8;
            this.bitvector[BYTE_SIZE - byteLoc - 1] |= bitLoc;
        }
    };
    /**
     * Checks if an element is in the bloom.
     * @param e - The element to check
     */
    Bloom.prototype.check = function (e) {
        assert(Buffer.isBuffer(e), 'Element should be Buffer');
        e = ethereumjs_util_1.keccak256(e);
        var mask = 2047; // binary 11111111111
        var match = true;
        for (var i = 0; i < 3 && match; i++) {
            var first2bytes = e.readUInt16BE(i * 2);
            var loc = mask & first2bytes;
            var byteLoc = loc >> 3;
            var bitLoc = 1 << loc % 8;
            match = (this.bitvector[BYTE_SIZE - byteLoc - 1] & bitLoc) !== 0;
        }
        return Boolean(match);
    };
    /**
     * Checks if multiple topics are in a bloom.
     * @returns `true` if every topic is in the bloom
     */
    Bloom.prototype.multiCheck = function (topics) {
        var _this = this;
        return topics.every(function (t) { return _this.check(t); });
    };
    /**
     * Bitwise or blooms together.
     */
    Bloom.prototype.or = function (bloom) {
        if (bloom) {
            for (var i = 0; i <= BYTE_SIZE; i++) {
                this.bitvector[i] = this.bitvector[i] | bloom.bitvector[i];
            }
        }
    };
    return Bloom;
}());
exports.default = Bloom;
//# sourceMappingURL=index.js.map
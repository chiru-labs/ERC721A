"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsString = exports.assertIsArray = exports.assertIsBuffer = exports.assertIsHexString = void 0;
var ethjs_util_1 = require("ethjs-util");
/**
 * Throws if a string is not hex prefixed
 * @param {string} input string to check hex prefix of
 */
exports.assertIsHexString = function (input) {
    if (!ethjs_util_1.isHexString(input)) {
        var msg = "This method only supports 0x-prefixed hex strings but input was: " + input;
        throw new Error(msg);
    }
};
/**
 * Throws if input is not a buffer
 * @param {Buffer} input value to check
 */
exports.assertIsBuffer = function (input) {
    if (!Buffer.isBuffer(input)) {
        var msg = "This method only supports Buffer but input was: " + input;
        throw new Error(msg);
    }
};
/**
 * Throws if input is not an array
 * @param {number[]} input value to check
 */
exports.assertIsArray = function (input) {
    if (!Array.isArray(input)) {
        var msg = "This method only supports number arrays but input was: " + input;
        throw new Error(msg);
    }
};
/**
 * Throws if input is not a string
 * @param {string} input value to check
 */
exports.assertIsString = function (input) {
    if (typeof input !== 'string') {
        var msg = "This method only supports strings but input was: " + input;
        throw new Error(msg);
    }
};
//# sourceMappingURL=helpers.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doKeysMatch = exports.matchingNibbleLength = exports.nibblesToBuffer = exports.bufferToNibbles = void 0;
/**
 * Converts a buffer to a nibble array.
 * @private
 * @param key
 */
function bufferToNibbles(key) {
    var bkey = Buffer.from(key);
    var nibbles = [];
    for (var i = 0; i < bkey.length; i++) {
        var q = i * 2;
        nibbles[q] = bkey[i] >> 4;
        ++q;
        nibbles[q] = bkey[i] % 16;
    }
    return nibbles;
}
exports.bufferToNibbles = bufferToNibbles;
/**
 * Converts a nibble array into a buffer.
 * @private
 * @param arr - Nibble array
 */
function nibblesToBuffer(arr) {
    var buf = Buffer.alloc(arr.length / 2);
    for (var i = 0; i < buf.length; i++) {
        var q = i * 2;
        buf[i] = (arr[q] << 4) + arr[++q];
    }
    return buf;
}
exports.nibblesToBuffer = nibblesToBuffer;
/**
 * Returns the number of in order matching nibbles of two give nibble arrays.
 * @private
 * @param nib1
 * @param nib2
 */
function matchingNibbleLength(nib1, nib2) {
    var i = 0;
    while (nib1[i] === nib2[i] && nib1.length > i) {
        i++;
    }
    return i;
}
exports.matchingNibbleLength = matchingNibbleLength;
/**
 * Compare two nibble array keys.
 * @param keyA
 * @param keyB
 */
function doKeysMatch(keyA, keyB) {
    var length = matchingNibbleLength(keyA, keyB);
    return length === keyA.length && length === keyB.length;
}
exports.doKeysMatch = doKeysMatch;
//# sourceMappingURL=nibbles.js.map
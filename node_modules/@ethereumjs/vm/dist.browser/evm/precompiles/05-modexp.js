"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var evm_1 = require("../evm");
var assert = require('assert');
function multComplexity(x) {
    var fac1;
    var fac2;
    if (x.lten(64)) {
        return x.sqr();
    }
    else if (x.lten(1024)) {
        // return Math.floor(Math.pow(x, 2) / 4) + 96 * x - 3072
        fac1 = x.sqr().divn(4);
        fac2 = x.muln(96);
        return fac1.add(fac2).subn(3072);
    }
    else {
        // return Math.floor(Math.pow(x, 2) / 16) + 480 * x - 199680
        fac1 = x.sqr().divn(16);
        fac2 = x.muln(480);
        return fac1.add(fac2).subn(199680);
    }
}
function multComplexityEIP2565(x) {
    var words = x.addn(7).divn(8);
    return words.mul(words);
}
function getAdjustedExponentLength(data) {
    var expBytesStart;
    try {
        var baseLen = new ethereumjs_util_1.BN(data.slice(0, 32)).toNumber();
        expBytesStart = 96 + baseLen; // 96 for base length, then exponent length, and modulus length, then baseLen for the base data, then exponent bytes start
    }
    catch (e) {
        expBytesStart = Number.MAX_SAFE_INTEGER - 32;
    }
    var expLen = new ethereumjs_util_1.BN(data.slice(32, 64));
    var firstExpBytes = Buffer.from(data.slice(expBytesStart, expBytesStart + 32)); // first word of the exponent data
    firstExpBytes = (0, ethereumjs_util_1.setLengthRight)(firstExpBytes, 32); // reading past the data reads virtual zeros
    var firstExpBN = new ethereumjs_util_1.BN(firstExpBytes);
    var max32expLen = 0;
    if (expLen.ltn(32)) {
        max32expLen = 32 - expLen.toNumber();
    }
    firstExpBN = firstExpBN.shrn(8 * Math.max(max32expLen, 0));
    var bitLen = -1;
    while (firstExpBN.gtn(0)) {
        bitLen = bitLen + 1;
        firstExpBN = firstExpBN.ushrn(1);
    }
    var expLenMinus32OrZero = expLen.subn(32);
    if (expLenMinus32OrZero.ltn(0)) {
        expLenMinus32OrZero = new ethereumjs_util_1.BN(0);
    }
    var eightTimesExpLenMinus32OrZero = expLenMinus32OrZero.muln(8);
    var adjustedExpLen = eightTimesExpLenMinus32OrZero;
    if (bitLen > 0) {
        adjustedExpLen.iaddn(bitLen);
    }
    return adjustedExpLen;
}
function expmod(B, E, M) {
    if (E.isZero())
        return new ethereumjs_util_1.BN(1).mod(M);
    // Red asserts M > 1
    if (M.lten(1))
        return new ethereumjs_util_1.BN(0);
    var red = ethereumjs_util_1.BN.red(M);
    var redB = B.toRed(red);
    var res = redB.redPow(E);
    return res.fromRed();
}
function default_1(opts) {
    assert(opts.data);
    var data = opts.data;
    var adjustedELen = getAdjustedExponentLength(data);
    if (adjustedELen.ltn(1)) {
        adjustedELen = new ethereumjs_util_1.BN(1);
    }
    var bLen = new ethereumjs_util_1.BN(data.slice(0, 32));
    var eLen = new ethereumjs_util_1.BN(data.slice(32, 64));
    var mLen = new ethereumjs_util_1.BN(data.slice(64, 96));
    var maxLen = bLen;
    if (maxLen.lt(mLen)) {
        maxLen = mLen;
    }
    var Gquaddivisor = opts._common.param('gasPrices', 'modexpGquaddivisor');
    var gasUsed;
    var bStart = new ethereumjs_util_1.BN(96);
    var bEnd = bStart.add(bLen);
    var eStart = bEnd;
    var eEnd = eStart.add(eLen);
    var mStart = eEnd;
    var mEnd = mStart.add(mLen);
    if (!opts._common.isActivatedEIP(2565)) {
        gasUsed = adjustedELen.mul(multComplexity(maxLen)).divn(Gquaddivisor);
    }
    else {
        gasUsed = adjustedELen.mul(multComplexityEIP2565(maxLen)).divn(Gquaddivisor);
        if (gasUsed.ltn(200)) {
            gasUsed = new ethereumjs_util_1.BN(200);
        }
    }
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    if (bLen.isZero()) {
        return {
            gasUsed: gasUsed,
            returnValue: new ethereumjs_util_1.BN(0).toArrayLike(Buffer, 'be', mLen.toNumber()),
        };
    }
    if (mLen.isZero()) {
        return {
            gasUsed: gasUsed,
            returnValue: Buffer.alloc(0),
        };
    }
    var maxInt = new ethereumjs_util_1.BN(Number.MAX_SAFE_INTEGER);
    var maxSize = new ethereumjs_util_1.BN(2147483647); // ethereumjs-util setLengthRight limitation
    if (bLen.gt(maxSize) || eLen.gt(maxSize) || mLen.gt(maxSize)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    var B = new ethereumjs_util_1.BN((0, ethereumjs_util_1.setLengthRight)(data.slice(bStart.toNumber(), bEnd.toNumber()), bLen.toNumber()));
    var E = new ethereumjs_util_1.BN((0, ethereumjs_util_1.setLengthRight)(data.slice(eStart.toNumber(), eEnd.toNumber()), eLen.toNumber()));
    var M = new ethereumjs_util_1.BN((0, ethereumjs_util_1.setLengthRight)(data.slice(mStart.toNumber(), mEnd.toNumber()), mLen.toNumber()));
    if (mEnd.gt(maxInt)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    var R;
    if (M.isZero()) {
        R = new ethereumjs_util_1.BN(0);
    }
    else {
        R = expmod(B, E, M);
    }
    return {
        gasUsed: gasUsed,
        returnValue: R.toArrayLike(Buffer, 'be', mLen.toNumber()),
    };
}
exports.default = default_1;
//# sourceMappingURL=05-modexp.js.map
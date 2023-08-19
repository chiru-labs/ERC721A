"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLS12_381_ToFp2Point = exports.BLS12_381_ToFpPoint = exports.BLS12_381_ToFrPoint = exports.BLS12_381_FromG2Point = exports.BLS12_381_ToG2Point = exports.BLS12_381_FromG1Point = exports.BLS12_381_ToG1Point = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
var exceptions_1 = require("../../../exceptions");
// base field modulus as described in the EIP
var fieldModulus = new ethereumjs_util_1.BN('1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab', 16);
// convert an input Buffer to a mcl G1 point
// this does /NOT/ do any input checks. the input Buffer needs to be of length 128
// it does raise an error if the point is not on the curve.
function BLS12_381_ToG1Point(input, mcl) {
    var p_x = input.slice(16, 64).toString('hex');
    var p_y = input.slice(80, 128).toString('hex');
    var ZeroString48Bytes = '0'.repeat(96);
    if (p_x == p_y && p_x == ZeroString48Bytes) {
        return new mcl.G1();
    }
    var Fp_X = new mcl.Fp();
    var Fp_Y = new mcl.Fp();
    var One = new mcl.Fp();
    Fp_X.setStr(p_x, 16);
    Fp_Y.setStr(p_y, 16);
    One.setStr('1', 16);
    var G1 = new mcl.G1();
    G1.setX(Fp_X);
    G1.setY(Fp_Y);
    G1.setZ(One);
    if (!G1.isValidOrder()) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE);
    }
    // Check if these coordinates are actually on the curve.
    if (!G1.isValid()) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE);
    }
    return G1;
}
exports.BLS12_381_ToG1Point = BLS12_381_ToG1Point;
// input: a mcl G1 point
// output: a 128-byte Buffer
function BLS12_381_FromG1Point(input) {
    // TODO: figure out if there is a better way to decode these values.
    var decodeStr = input.getStr(16); //return a string of pattern "1 <x_coord> <y_coord>"
    var decoded = decodeStr.match(/"?[0-9a-f]+"?/g); // match above pattern.
    if (decodeStr == '0') {
        return Buffer.alloc(128, 0);
    }
    // note: decoded[0] == 1
    var xval = (0, ethereumjs_util_1.padToEven)(decoded[1]);
    var yval = (0, ethereumjs_util_1.padToEven)(decoded[2]);
    // convert to buffers.
    var xBuffer = Buffer.concat([Buffer.alloc(64 - xval.length / 2, 0), Buffer.from(xval, 'hex')]);
    var yBuffer = Buffer.concat([Buffer.alloc(64 - yval.length / 2, 0), Buffer.from(yval, 'hex')]);
    return Buffer.concat([xBuffer, yBuffer]);
}
exports.BLS12_381_FromG1Point = BLS12_381_FromG1Point;
// convert an input Buffer to a mcl G2 point
// this does /NOT/ do any input checks. the input Buffer needs to be of length 256
function BLS12_381_ToG2Point(input, mcl) {
    var p_x_1 = input.slice(0, 64);
    var p_x_2 = input.slice(64, 128);
    var p_y_1 = input.slice(128, 192);
    var p_y_2 = input.slice(192, 256);
    var ZeroBytes64 = Buffer.alloc(64, 0);
    // check if we have to do with a zero point
    if (p_x_1.equals(p_x_2) &&
        p_x_1.equals(p_y_1) &&
        p_x_1.equals(p_y_2) &&
        p_x_1.equals(ZeroBytes64)) {
        return new mcl.G2();
    }
    var Fp2X = BLS12_381_ToFp2Point(p_x_1, p_x_2, mcl);
    var Fp2Y = BLS12_381_ToFp2Point(p_y_1, p_y_2, mcl);
    var FpOne = new mcl.Fp();
    FpOne.setStr('1', 16);
    var FpZero = new mcl.Fp();
    FpZero.setStr('0', 16);
    var Fp2One = new mcl.Fp2();
    Fp2One.set_a(FpOne);
    Fp2One.set_b(FpZero);
    var mclPoint = new mcl.G2();
    mclPoint.setX(Fp2X);
    mclPoint.setY(Fp2Y);
    mclPoint.setZ(Fp2One);
    if (!mclPoint.isValidOrder()) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE);
    }
    if (!mclPoint.isValid()) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE);
    }
    return mclPoint;
}
exports.BLS12_381_ToG2Point = BLS12_381_ToG2Point;
// input: a mcl G2 point
// output: a 256-byte Buffer
function BLS12_381_FromG2Point(input) {
    // TODO: figure out if there is a better way to decode these values.
    var decodeStr = input.getStr(16); //return a string of pattern "1 <x_coord_1> <x_coord_2> <y_coord_1> <y_coord_2>"
    if (decodeStr == '0') {
        return Buffer.alloc(256, 0);
    }
    var decoded = decodeStr.match(/"?[0-9a-f]+"?/g); // match above pattern.
    // note: decoded[0] == 1
    var x_1 = (0, ethereumjs_util_1.padToEven)(decoded[1]);
    var x_2 = (0, ethereumjs_util_1.padToEven)(decoded[2]);
    var y_1 = (0, ethereumjs_util_1.padToEven)(decoded[3]);
    var y_2 = (0, ethereumjs_util_1.padToEven)(decoded[4]);
    // convert to buffers.
    var xBuffer1 = Buffer.concat([Buffer.alloc(64 - x_1.length / 2, 0), Buffer.from(x_1, 'hex')]);
    var xBuffer2 = Buffer.concat([Buffer.alloc(64 - x_2.length / 2, 0), Buffer.from(x_2, 'hex')]);
    var yBuffer1 = Buffer.concat([Buffer.alloc(64 - y_1.length / 2, 0), Buffer.from(y_1, 'hex')]);
    var yBuffer2 = Buffer.concat([Buffer.alloc(64 - y_2.length / 2, 0), Buffer.from(y_2, 'hex')]);
    return Buffer.concat([xBuffer1, xBuffer2, yBuffer1, yBuffer2]);
}
exports.BLS12_381_FromG2Point = BLS12_381_FromG2Point;
// input: a 32-byte hex scalar Buffer
// output: a mcl Fr point
function BLS12_381_ToFrPoint(input, mcl) {
    var mclHex = mcl.fromHexStr(input.toString('hex'));
    var Fr = new mcl.Fr();
    Fr.setBigEndianMod(mclHex);
    return Fr;
}
exports.BLS12_381_ToFrPoint = BLS12_381_ToFrPoint;
// input: a 64-byte buffer
// output: a mcl Fp point
function BLS12_381_ToFpPoint(fpCoordinate, mcl) {
    // check if point is in field
    if (new ethereumjs_util_1.BN(fpCoordinate).gte(fieldModulus)) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_FP_NOT_IN_FIELD);
    }
    var fp = new mcl.Fp();
    fp.setBigEndianMod(mcl.fromHexStr(fpCoordinate.toString('hex')));
    return fp;
}
exports.BLS12_381_ToFpPoint = BLS12_381_ToFpPoint;
// input: two 64-byte buffers
// output: a mcl Fp2 point
function BLS12_381_ToFp2Point(fpXCoordinate, fpYCoordinate, mcl) {
    // check if the coordinates are in the field
    if (new ethereumjs_util_1.BN(fpXCoordinate).gte(fieldModulus)) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_FP_NOT_IN_FIELD);
    }
    if (new ethereumjs_util_1.BN(fpYCoordinate).gte(fieldModulus)) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_FP_NOT_IN_FIELD);
    }
    var fp_x = new mcl.Fp();
    var fp_y = new mcl.Fp();
    var fp2 = new mcl.Fp2();
    fp_x.setStr(fpXCoordinate.slice(16).toString('hex'), 16);
    fp_y.setStr(fpYCoordinate.slice(16).toString('hex'), 16);
    fp2.set_a(fp_x);
    fp2.set_b(fp_y);
    return fp2;
}
exports.BLS12_381_ToFp2Point = BLS12_381_ToFp2Point;
//# sourceMappingURL=bls12_381.js.map
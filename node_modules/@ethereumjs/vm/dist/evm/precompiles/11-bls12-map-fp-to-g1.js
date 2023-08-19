"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const evm_1 = require("../evm");
const exceptions_1 = require("../../exceptions");
const assert = require('assert');
const { BLS12_381_ToFpPoint, BLS12_381_FromG1Point } = require('./util/bls12_381');
async function default_1(opts) {
    assert(opts.data);
    const mcl = opts._VM._mcl;
    const inputData = opts.data;
    // note: the gas used is constant; even if the input is incorrect.
    const gasUsed = new ethereumjs_util_1.BN(opts._common.paramByEIP('gasPrices', 'Bls12381MapG1Gas', 2537));
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    if (inputData.length != 64) {
        return (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit);
    }
    // check if some parts of input are zero bytes.
    const zeroBytes16 = Buffer.alloc(16, 0);
    if (!opts.data.slice(0, 16).equals(zeroBytes16)) {
        return (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit);
    }
    // convert input to mcl Fp1 point
    let Fp1Point;
    try {
        Fp1Point = BLS12_381_ToFpPoint(opts.data.slice(0, 64), mcl);
    }
    catch (e) {
        return (0, evm_1.VmErrorResult)(e, opts.gasLimit);
    }
    // map it to G1
    const result = Fp1Point.mapToG1();
    const returnValue = BLS12_381_FromG1Point(result);
    return {
        gasUsed,
        returnValue: returnValue,
    };
}
exports.default = default_1;
//# sourceMappingURL=11-bls12-map-fp-to-g1.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const evm_1 = require("../evm");
const exceptions_1 = require("../../exceptions");
const assert = require('assert');
const { BLS12_381_ToG1Point, BLS12_381_FromG1Point } = require('./util/bls12_381');
async function default_1(opts) {
    assert(opts.data);
    const mcl = opts._VM._mcl;
    const inputData = opts.data;
    // note: the gas used is constant; even if the input is incorrect.
    const gasUsed = new ethereumjs_util_1.BN(opts._common.paramByEIP('gasPrices', 'Bls12381G1AddGas', 2537));
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    if (inputData.length != 256) {
        return (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit);
    }
    // check if some parts of input are zero bytes.
    const zeroBytes16 = Buffer.alloc(16, 0);
    const zeroByteCheck = [
        [0, 16],
        [64, 80],
        [128, 144],
        [192, 208],
    ];
    for (const index in zeroByteCheck) {
        const slicedBuffer = opts.data.slice(zeroByteCheck[index][0], zeroByteCheck[index][1]);
        if (!slicedBuffer.equals(zeroBytes16)) {
            return (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit);
        }
    }
    // convert input to mcl G1 points, add them, and convert the output to a Buffer.
    let mclPoint1;
    let mclPoint2;
    try {
        mclPoint1 = BLS12_381_ToG1Point(opts.data.slice(0, 128), mcl);
        mclPoint2 = BLS12_381_ToG1Point(opts.data.slice(128, 256), mcl);
    }
    catch (e) {
        return (0, evm_1.VmErrorResult)(e, opts.gasLimit);
    }
    const result = mcl.add(mclPoint1, mclPoint2);
    const returnValue = BLS12_381_FromG1Point(result);
    return {
        gasUsed,
        returnValue: returnValue,
    };
}
exports.default = default_1;
//# sourceMappingURL=0a-bls12-g1add.js.map
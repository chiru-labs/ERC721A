"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const evm_1 = require("../evm");
const exceptions_1 = require("../../exceptions");
const assert = require('assert');
const { BLS12_381_ToG2Point, BLS12_381_ToFrPoint, BLS12_381_FromG2Point, } = require('./util/bls12_381');
async function default_1(opts) {
    assert(opts.data);
    const mcl = opts._VM._mcl;
    const inputData = opts.data;
    if (inputData.length == 0) {
        return (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_INPUT_EMPTY), opts.gasLimit); // follow Geths implementation
    }
    const numPairs = Math.floor(inputData.length / 288);
    const gasUsedPerPair = new ethereumjs_util_1.BN(opts._common.paramByEIP('gasPrices', 'Bls12381G2MulGas', 2537));
    const gasDiscountArray = opts._common.paramByEIP('gasPrices', 'Bls12381MultiExpGasDiscount', 2537);
    const gasDiscountMax = gasDiscountArray[gasDiscountArray.length - 1][1];
    let gasDiscountMultiplier;
    if (numPairs <= gasDiscountArray.length) {
        if (numPairs == 0) {
            gasDiscountMultiplier = 0; // this implicitly sets gasUsed to 0 as per the EIP.
        }
        else {
            gasDiscountMultiplier = gasDiscountArray[numPairs - 1][1];
        }
    }
    else {
        gasDiscountMultiplier = gasDiscountMax;
    }
    const gasUsed = gasUsedPerPair.imuln(numPairs).imuln(gasDiscountMultiplier).idivn(1000);
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    if (inputData.length % 288 != 0) {
        return (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit);
    }
    // prepare pairing list and check for mandatory zero bytes
    const zeroBytes16 = Buffer.alloc(16, 0);
    const zeroByteCheck = [
        [0, 16],
        [64, 80],
        [128, 144],
        [192, 208],
    ];
    const G2Array = [];
    const FrArray = [];
    for (let k = 0; k < inputData.length / 288; k++) {
        // zero bytes check
        const pairStart = 288 * k;
        for (const index in zeroByteCheck) {
            const slicedBuffer = opts.data.slice(zeroByteCheck[index][0] + pairStart, zeroByteCheck[index][1] + pairStart);
            if (!slicedBuffer.equals(zeroBytes16)) {
                return (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit);
            }
        }
        let G2;
        try {
            G2 = BLS12_381_ToG2Point(opts.data.slice(pairStart, pairStart + 256), mcl);
        }
        catch (e) {
            return (0, evm_1.VmErrorResult)(e, opts.gasLimit);
        }
        const Fr = BLS12_381_ToFrPoint(opts.data.slice(pairStart + 256, pairStart + 288), mcl);
        G2Array.push(G2);
        FrArray.push(Fr);
    }
    const result = mcl.mulVec(G2Array, FrArray);
    const returnValue = BLS12_381_FromG2Point(result);
    return {
        gasUsed,
        returnValue: returnValue,
    };
}
exports.default = default_1;
//# sourceMappingURL=0f-bls12-g2multiexp.js.map
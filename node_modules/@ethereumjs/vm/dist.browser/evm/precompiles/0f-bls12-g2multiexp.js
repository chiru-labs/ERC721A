"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var evm_1 = require("../evm");
var exceptions_1 = require("../../exceptions");
var assert = require('assert');
var _a = require('./util/bls12_381'), BLS12_381_ToG2Point = _a.BLS12_381_ToG2Point, BLS12_381_ToFrPoint = _a.BLS12_381_ToFrPoint, BLS12_381_FromG2Point = _a.BLS12_381_FromG2Point;
function default_1(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var mcl, inputData, numPairs, gasUsedPerPair, gasDiscountArray, gasDiscountMax, gasDiscountMultiplier, gasUsed, zeroBytes16, zeroByteCheck, G2Array, FrArray, k, pairStart, index, slicedBuffer, G2, Fr, result, returnValue;
        return __generator(this, function (_a) {
            assert(opts.data);
            mcl = opts._VM._mcl;
            inputData = opts.data;
            if (inputData.length == 0) {
                return [2 /*return*/, (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_INPUT_EMPTY), opts.gasLimit)]; // follow Geths implementation
            }
            numPairs = Math.floor(inputData.length / 288);
            gasUsedPerPair = new ethereumjs_util_1.BN(opts._common.paramByEIP('gasPrices', 'Bls12381G2MulGas', 2537));
            gasDiscountArray = opts._common.paramByEIP('gasPrices', 'Bls12381MultiExpGasDiscount', 2537);
            gasDiscountMax = gasDiscountArray[gasDiscountArray.length - 1][1];
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
            gasUsed = gasUsedPerPair.imuln(numPairs).imuln(gasDiscountMultiplier).idivn(1000);
            if (opts.gasLimit.lt(gasUsed)) {
                return [2 /*return*/, (0, evm_1.OOGResult)(opts.gasLimit)];
            }
            if (inputData.length % 288 != 0) {
                return [2 /*return*/, (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit)];
            }
            zeroBytes16 = Buffer.alloc(16, 0);
            zeroByteCheck = [
                [0, 16],
                [64, 80],
                [128, 144],
                [192, 208],
            ];
            G2Array = [];
            FrArray = [];
            for (k = 0; k < inputData.length / 288; k++) {
                pairStart = 288 * k;
                for (index in zeroByteCheck) {
                    slicedBuffer = opts.data.slice(zeroByteCheck[index][0] + pairStart, zeroByteCheck[index][1] + pairStart);
                    if (!slicedBuffer.equals(zeroBytes16)) {
                        return [2 /*return*/, (0, evm_1.VmErrorResult)(new exceptions_1.VmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit)];
                    }
                }
                G2 = void 0;
                try {
                    G2 = BLS12_381_ToG2Point(opts.data.slice(pairStart, pairStart + 256), mcl);
                }
                catch (e) {
                    return [2 /*return*/, (0, evm_1.VmErrorResult)(e, opts.gasLimit)];
                }
                Fr = BLS12_381_ToFrPoint(opts.data.slice(pairStart + 256, pairStart + 288), mcl);
                G2Array.push(G2);
                FrArray.push(Fr);
            }
            result = mcl.mulVec(G2Array, FrArray);
            returnValue = BLS12_381_FromG2Point(result);
            return [2 /*return*/, {
                    gasUsed: gasUsed,
                    returnValue: returnValue,
                }];
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=0f-bls12-g2multiexp.js.map
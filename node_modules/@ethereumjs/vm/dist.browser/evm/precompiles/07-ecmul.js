"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var evm_1 = require("../evm");
var assert = require('assert');
var bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    var inputData = opts.data;
    var gasUsed = new ethereumjs_util_1.BN(opts._common.param('gasPrices', 'ecMul'));
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    var returnData = bn128.mul(inputData);
    // check ecmul success or failure by comparing the output length
    if (returnData.length !== 64) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    return {
        gasUsed: gasUsed,
        returnValue: returnData,
    };
}
exports.default = default_1;
//# sourceMappingURL=07-ecmul.js.map
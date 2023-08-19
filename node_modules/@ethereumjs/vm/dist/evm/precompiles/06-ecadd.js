"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const evm_1 = require("../evm");
const assert = require('assert');
const bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    const inputData = opts.data;
    const gasUsed = new ethereumjs_util_1.BN(opts._common.param('gasPrices', 'ecAdd'));
    if (opts.gasLimit.lt(gasUsed)) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    const returnData = bn128.add(inputData);
    // check ecadd success or failure by comparing the output length
    if (returnData.length !== 64) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    return {
        gasUsed,
        returnValue: returnData,
    };
}
exports.default = default_1;
//# sourceMappingURL=06-ecadd.js.map
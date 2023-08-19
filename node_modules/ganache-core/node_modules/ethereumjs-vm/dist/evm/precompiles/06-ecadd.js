"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var evm_1 = require("../evm");
var assert = require('assert');
var bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    var inputData = opts.data;
    var gasUsed = new BN(opts._common.param('gasPrices', 'ecAdd'));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    var returnData = bn128.add(inputData);
    // check ecadd success or failure by comparing the output length
    if (returnData.length !== 64) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed: gasUsed,
        returnValue: returnData,
    };
}
exports.default = default_1;
//# sourceMappingURL=06-ecadd.js.map
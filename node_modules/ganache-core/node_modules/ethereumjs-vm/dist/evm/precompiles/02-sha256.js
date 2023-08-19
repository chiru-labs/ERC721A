"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ethereumjs_util_1 = require("ethereumjs-util");
var evm_1 = require("../evm");
var assert = require('assert');
function default_1(opts) {
    assert(opts.data);
    var data = opts.data;
    var gasUsed = new BN(opts._common.param('gasPrices', 'sha256'));
    gasUsed.iadd(new BN(opts._common.param('gasPrices', 'sha256Word')).imuln(Math.ceil(data.length / 32)));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed: gasUsed,
        returnValue: ethereumjs_util_1.sha256(data),
    };
}
exports.default = default_1;
//# sourceMappingURL=02-sha256.js.map
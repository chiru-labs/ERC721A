"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var evm_1 = require("../evm");
var assert = require('assert');
function default_1(opts) {
    assert(opts.data);
    var data = opts.data;
    var gasUsed = new BN(opts._common.param('gasPrices', 'identity'));
    gasUsed.iadd(new BN(opts._common.param('gasPrices', 'identityWord')).imuln(Math.ceil(data.length / 32)));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed: gasUsed,
        returnValue: data,
    };
}
exports.default = default_1;
//# sourceMappingURL=04-identity.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportCalledOnContractWith = void 0;
const calledOnContractValidators_1 = require("./calledOnContractValidators");
function supportCalledOnContractWith(Assertion) {
    Assertion.addMethod('calledOnContractWith', function (contract, parameters) {
        const fnName = this._obj;
        calledOnContractValidators_1.validateContract(contract);
        calledOnContractValidators_1.validateMockProvider(contract.provider);
        calledOnContractValidators_1.validateFnName(fnName, contract);
        const funCallData = contract.interface.encodeFunctionData(fnName, parameters);
        this.assert(contract.provider.callHistory.some(call => call.address === contract.address && call.data === funCallData), 'Expected contract function with parameters to be called', 'Expected contract function with parameters NOT to be called', undefined);
    });
}
exports.supportCalledOnContractWith = supportCalledOnContractWith;

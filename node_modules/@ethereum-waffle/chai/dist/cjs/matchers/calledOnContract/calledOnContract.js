"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportCalledOnContract = void 0;
const calledOnContractValidators_1 = require("./calledOnContractValidators");
function supportCalledOnContract(Assertion) {
    Assertion.addMethod('calledOnContract', function (contract) {
        const fnName = this._obj;
        calledOnContractValidators_1.validateContract(contract);
        calledOnContractValidators_1.validateMockProvider(contract.provider);
        if (fnName !== undefined) {
            calledOnContractValidators_1.validateFnName(fnName, contract);
        }
        const fnSighash = contract.interface.getSighash(fnName);
        this.assert(contract.provider.callHistory.some(call => call.address === contract.address && call.data.startsWith(fnSighash)), 'Expected contract function to be called', 'Expected contract function NOT to be called', undefined);
    });
}
exports.supportCalledOnContract = supportCalledOnContract;

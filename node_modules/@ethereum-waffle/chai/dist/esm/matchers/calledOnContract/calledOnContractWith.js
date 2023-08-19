import { validateContract, validateFnName, validateMockProvider } from './calledOnContractValidators';
export function supportCalledOnContractWith(Assertion) {
    Assertion.addMethod('calledOnContractWith', function (contract, parameters) {
        const fnName = this._obj;
        validateContract(contract);
        validateMockProvider(contract.provider);
        validateFnName(fnName, contract);
        const funCallData = contract.interface.encodeFunctionData(fnName, parameters);
        this.assert(contract.provider.callHistory.some(call => call.address === contract.address && call.data === funCallData), 'Expected contract function with parameters to be called', 'Expected contract function with parameters NOT to be called', undefined);
    });
}

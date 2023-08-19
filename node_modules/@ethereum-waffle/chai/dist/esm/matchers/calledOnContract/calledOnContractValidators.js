import { Contract } from 'ethers';
import { ProviderWithHistoryExpected } from './error';
import { ensure } from './utils';
export function validateContract(contract) {
    ensure(contract instanceof Contract, TypeError, 'argument must be a contract');
}
export function validateMockProvider(provider) {
    ensure((!!provider.callHistory && provider.callHistory instanceof Array), ProviderWithHistoryExpected);
}
export function validateFnName(fnName, contract) {
    ensure(typeof fnName === 'string', TypeError, 'function name must be a string');
    function isFunction(name) {
        try {
            return !!contract.interface.getFunction(name);
        }
        catch (e) {
            return false;
        }
    }
    ensure(isFunction(fnName), TypeError, 'function must exist in provided contract');
}

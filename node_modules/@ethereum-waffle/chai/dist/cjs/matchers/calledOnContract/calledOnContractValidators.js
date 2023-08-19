"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFnName = exports.validateMockProvider = exports.validateContract = void 0;
const ethers_1 = require("ethers");
const error_1 = require("./error");
const utils_1 = require("./utils");
function validateContract(contract) {
    utils_1.ensure(contract instanceof ethers_1.Contract, TypeError, 'argument must be a contract');
}
exports.validateContract = validateContract;
function validateMockProvider(provider) {
    utils_1.ensure((!!provider.callHistory && provider.callHistory instanceof Array), error_1.ProviderWithHistoryExpected);
}
exports.validateMockProvider = validateMockProvider;
function validateFnName(fnName, contract) {
    utils_1.ensure(typeof fnName === 'string', TypeError, 'function name must be a string');
    function isFunction(name) {
        try {
            return !!contract.interface.getFunction(name);
        }
        catch (e) {
            return false;
        }
    }
    utils_1.ensure(isFunction(fnName), TypeError, 'function must exist in provided contract');
}
exports.validateFnName = validateFnName;

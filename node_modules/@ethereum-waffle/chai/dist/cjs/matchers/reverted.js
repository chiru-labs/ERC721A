"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportReverted = void 0;
function supportReverted(Assertion) {
    Assertion.addProperty('reverted', function () {
        const promise = this._obj;
        const onSuccess = (value) => {
            this.assert(false, 'Expected transaction to be reverted', 'Expected transaction NOT to be reverted', 'Transaction reverted.', 'Transaction NOT reverted.');
            return value;
        };
        const onError = (error) => {
            const message = (error instanceof Object && 'message' in error) ? error.message : JSON.stringify(error);
            const isReverted = message.search('revert') >= 0;
            const isThrown = message.search('invalid opcode') >= 0;
            const isError = message.search('code=') >= 0;
            this.assert(isReverted || isThrown || isError, `Expected transaction to be reverted, but other exception was thrown: ${error}`, 'Expected transaction NOT to be reverted', 'Transaction reverted.', error);
            return error;
        };
        const derivedPromise = promise.then(onSuccess, onError);
        this.then = derivedPromise.then.bind(derivedPromise);
        this.catch = derivedPromise.catch.bind(derivedPromise);
        return this;
    });
}
exports.supportReverted = supportReverted;

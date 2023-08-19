import { BigNumber } from 'ethers';
import { getAddressOf } from './misc/account';
import { getBalanceChange } from './changeEtherBalance';
export function supportChangeBalance(Assertion) {
    Assertion.addMethod('changeBalance', function (account, balanceChange) {
        const subject = this._obj;
        const derivedPromise = Promise.all([
            getBalanceChange(subject, account, { includeFee: true }),
            getAddressOf(account)
        ]).then(([actualChange, address]) => {
            this.assert(actualChange.eq(BigNumber.from(balanceChange)), `Expected "${address}" to change balance by ${balanceChange} wei, ` +
                `but it has changed by ${actualChange} wei`, `Expected "${address}" to not change balance by ${balanceChange} wei,`, balanceChange, actualChange);
        });
        this.then = derivedPromise.then.bind(derivedPromise);
        this.catch = derivedPromise.catch.bind(derivedPromise);
        this.promise = derivedPromise;
        return this;
    });
}

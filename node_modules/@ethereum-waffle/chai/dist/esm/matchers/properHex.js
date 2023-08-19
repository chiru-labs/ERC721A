export function supportProperHex(Assertion) {
    Assertion.addMethod('properHex', function (length) {
        const subject = this._obj;
        const regexp = new RegExp(`^0x[0-9-a-fA-F]{${length}}$`);
        this.assert(regexp.test(subject), `Expected "${subject}" to be a proper hex of length ${length}`, `Expected "${subject}" not to be a proper hex of length ${length}, but it was`, 'proper address (eg.: 0x1234567890123456789012345678901234567890)', subject);
    });
}

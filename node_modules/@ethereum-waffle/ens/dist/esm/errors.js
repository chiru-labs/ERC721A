export class MissingDomain extends Error {
    constructor(domain) {
        super(`Domain ${domain} doesn't exist.`);
    }
}
export class InvalidDomain extends Error {
    constructor(domain) {
        super(`Invalid domain: '${domain}'`);
    }
}
export class ExpectedTopLevelDomain extends Error {
    constructor() {
        super('Invalid domain. Please, enter no top level domain.');
        Object.setPrototypeOf(this, ExpectedTopLevelDomain.prototype);
    }
}

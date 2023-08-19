"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpectedTopLevelDomain = exports.InvalidDomain = exports.MissingDomain = void 0;
class MissingDomain extends Error {
    constructor(domain) {
        super(`Domain ${domain} doesn't exist.`);
    }
}
exports.MissingDomain = MissingDomain;
class InvalidDomain extends Error {
    constructor(domain) {
        super(`Invalid domain: '${domain}'`);
    }
}
exports.InvalidDomain = InvalidDomain;
class ExpectedTopLevelDomain extends Error {
    constructor() {
        super('Invalid domain. Please, enter no top level domain.');
        Object.setPrototypeOf(this, ExpectedTopLevelDomain.prototype);
    }
}
exports.ExpectedTopLevelDomain = ExpectedTopLevelDomain;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnreachableCaseError extends Error {
    constructor(value) {
        super(`Unreachable case: ${value}`);
    }
}
exports.UnreachableCaseError = UnreachableCaseError;
function assert(condition, msg = "no additional info provided") {
    if (!condition) {
        throw new Error("Assertion Error: " + msg);
    }
}
exports.assert = assert;
function noop(..._args) { }
exports.noop = noop;
//# sourceMappingURL=functions.js.map
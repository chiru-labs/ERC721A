"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnreachableCaseError extends Error {
    constructor(value) {
        super(`Unreachable case: ${value}`);
    }
}
exports.UnreachableCaseError = UnreachableCaseError;
function literal(value) {
    return value;
}
exports.literal = literal;
//# sourceMappingURL=functions.js.map
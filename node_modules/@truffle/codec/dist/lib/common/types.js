"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownUserDefinedTypeError = void 0;
/**
 * This error indicates that the decoder was unable to locate a user-defined
 * type (struct, enum, or contract type) via its ID.  Unfortunately, we can't
 * always avoid this at the moment; we're hoping to make this more robust in
 * the future with Truffle DB.  In the meantime, it is at least worth noting that
 * you should not encounter this error if your entire project was written in
 * Solidity and all compiled at once.  Sorry.
 *
 * @Category Errors
 */
class UnknownUserDefinedTypeError extends Error {
    constructor(id, typeString) {
        const message = `Cannot locate definition for ${typeString} (ID ${id})`;
        super(message);
        this.name = "UnknownUserDefinedTypeError";
        this.id = id;
        this.typeString = typeString;
    }
}
exports.UnknownUserDefinedTypeError = UnknownUserDefinedTypeError;
//# sourceMappingURL=types.js.map
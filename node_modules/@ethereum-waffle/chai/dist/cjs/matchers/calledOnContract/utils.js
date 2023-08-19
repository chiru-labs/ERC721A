"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensure = void 0;
function ensure(condition, ErrorToThrow, ...errorArgs) {
    if (!condition) {
        throw new ErrorToThrow(...errorArgs);
    }
}
exports.ensure = ensure;

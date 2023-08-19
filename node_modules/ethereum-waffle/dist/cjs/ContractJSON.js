"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasByteCode = exports.isStandard = void 0;
const isStandard = (data) => typeof data.evm === 'object' &&
    data.evm !== null &&
    typeof data.evm.bytecode === 'object' &&
    data.evm.bytecode !== null;
exports.isStandard = isStandard;
function hasByteCode(bytecode) {
    if (typeof bytecode === 'object') {
        return Object.entries(bytecode.object).length !== 0;
    }
    return Object.entries(bytecode).length !== 0;
}
exports.hasByteCode = hasByteCode;

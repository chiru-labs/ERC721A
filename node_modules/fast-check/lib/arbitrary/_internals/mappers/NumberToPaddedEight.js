"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToPaddedEightUnmapper = exports.numberToPaddedEightMapper = void 0;
function numberToPaddedEightMapper(n) {
    return n.toString(16).padStart(8, '0');
}
exports.numberToPaddedEightMapper = numberToPaddedEightMapper;
function numberToPaddedEightUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported type');
    }
    if (value.length !== 8) {
        throw new Error('Unsupported value: invalid length');
    }
    const n = parseInt(value, 16);
    if (value !== numberToPaddedEightMapper(n)) {
        throw new Error('Unsupported value: invalid content');
    }
    return n;
}
exports.numberToPaddedEightUnmapper = numberToPaddedEightUnmapper;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.charsToStringUnmapper = exports.charsToStringMapper = void 0;
function charsToStringMapper(tab) {
    return tab.join('');
}
exports.charsToStringMapper = charsToStringMapper;
function charsToStringUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Cannot unmap the passed value');
    }
    return value.split('');
}
exports.charsToStringUnmapper = charsToStringUnmapper;

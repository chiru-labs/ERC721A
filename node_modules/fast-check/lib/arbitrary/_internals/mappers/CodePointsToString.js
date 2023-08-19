"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codePointsToStringUnmapper = exports.codePointsToStringMapper = void 0;
function codePointsToStringMapper(tab) {
    return tab.join('');
}
exports.codePointsToStringMapper = codePointsToStringMapper;
function codePointsToStringUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Cannot unmap the passed value');
    }
    return [...value];
}
exports.codePointsToStringUnmapper = codePointsToStringUnmapper;

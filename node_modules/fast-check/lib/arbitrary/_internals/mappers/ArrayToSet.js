"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayToSetUnmapper = exports.arrayToSetMapper = void 0;
function arrayToSetMapper(data) {
    return new Set(data);
}
exports.arrayToSetMapper = arrayToSetMapper;
function arrayToSetUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if (!('constructor' in value) || value.constructor !== Set) {
        throw new Error('Incompatible instance received: should be of exact type Set');
    }
    return Array.from(value);
}
exports.arrayToSetUnmapper = arrayToSetUnmapper;

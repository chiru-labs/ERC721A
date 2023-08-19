"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentsToPathUnmapper = exports.segmentsToPathMapper = void 0;
function segmentsToPathMapper(segments) {
    return segments.map((v) => `/${v}`).join('');
}
exports.segmentsToPathMapper = segmentsToPathMapper;
function segmentsToPathUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Incompatible value received: type');
    }
    if (value.length !== 0 && value[0] !== '/') {
        throw new Error('Incompatible value received: start');
    }
    return value.split('/').splice(1);
}
exports.segmentsToPathUnmapper = segmentsToPathUnmapper;

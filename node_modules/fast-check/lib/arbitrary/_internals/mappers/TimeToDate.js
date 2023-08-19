"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeToDateUnmapper = exports.timeToDateMapper = void 0;
function timeToDateMapper(time) {
    return new Date(time);
}
exports.timeToDateMapper = timeToDateMapper;
function timeToDateUnmapper(value) {
    if (!(value instanceof Date) || value.constructor !== Date) {
        throw new Error('Not a valid value for date unmapper');
    }
    return value.getTime();
}
exports.timeToDateUnmapper = timeToDateUnmapper;

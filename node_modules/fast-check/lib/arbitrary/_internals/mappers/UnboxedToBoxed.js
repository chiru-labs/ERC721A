"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unboxedToBoxedUnmapper = exports.unboxedToBoxedMapper = void 0;
function unboxedToBoxedMapper(value) {
    switch (typeof value) {
        case 'boolean':
            return new Boolean(value);
        case 'number':
            return new Number(value);
        case 'string':
            return new String(value);
        default:
            return value;
    }
}
exports.unboxedToBoxedMapper = unboxedToBoxedMapper;
function unboxedToBoxedUnmapper(value) {
    if (typeof value !== 'object' || value === null || !('constructor' in value)) {
        return value;
    }
    return value.constructor === Boolean || value.constructor === Number || value.constructor === String
        ?
            value.valueOf()
        : value;
}
exports.unboxedToBoxedUnmapper = unboxedToBoxedUnmapper;

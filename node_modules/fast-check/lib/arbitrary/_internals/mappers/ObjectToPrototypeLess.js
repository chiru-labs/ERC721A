"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectToPrototypeLessUnmapper = exports.objectToPrototypeLessMapper = void 0;
function objectToPrototypeLessMapper(o) {
    return Object.assign(Object.create(null), o);
}
exports.objectToPrototypeLessMapper = objectToPrototypeLessMapper;
function objectToPrototypeLessUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if ('__proto__' in value) {
        throw new Error('Incompatible instance received: should not have any __proto__');
    }
    return Object.assign({}, value);
}
exports.objectToPrototypeLessUnmapper = objectToPrototypeLessUnmapper;

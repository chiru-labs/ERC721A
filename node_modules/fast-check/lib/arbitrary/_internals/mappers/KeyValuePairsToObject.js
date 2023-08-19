"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyValuePairsToObjectUnmapper = exports.keyValuePairsToObjectMapper = void 0;
function keyValuePairsToObjectMapper(items) {
    const obj = {};
    for (const keyValue of items) {
        obj[keyValue[0]] = keyValue[1];
    }
    return obj;
}
exports.keyValuePairsToObjectMapper = keyValuePairsToObjectMapper;
function buildInvalidPropertyNameFilter(obj) {
    return function invalidPropertyNameFilter(key) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        return (descriptor === undefined ||
            !descriptor.configurable ||
            !descriptor.enumerable ||
            !descriptor.writable ||
            descriptor.get !== undefined ||
            descriptor.set !== undefined);
    };
}
function keyValuePairsToObjectUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if (!('constructor' in value) || value.constructor !== Object) {
        throw new Error('Incompatible instance received: should be of exact type Object');
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new Error('Incompatible instance received: should contain symbols');
    }
    if (Object.getOwnPropertyNames(value).find(buildInvalidPropertyNameFilter(value)) !== undefined) {
        throw new Error('Incompatible instance received: should contain only c/e/w properties without get/set');
    }
    return Object.entries(value);
}
exports.keyValuePairsToObjectUnmapper = keyValuePairsToObjectUnmapper;

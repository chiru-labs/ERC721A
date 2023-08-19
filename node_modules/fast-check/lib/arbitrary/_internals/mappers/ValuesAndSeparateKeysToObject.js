"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildValuesAndSeparateKeysToObjectUnmapper = exports.buildValuesAndSeparateKeysToObjectMapper = void 0;
function buildValuesAndSeparateKeysToObjectMapper(keys, noKeyValue) {
    return function valuesAndSeparateKeysToObjectMapper(gs) {
        const obj = {};
        for (let idx = 0; idx !== keys.length; ++idx) {
            const valueWrapper = gs[idx];
            if (valueWrapper !== noKeyValue) {
                obj[keys[idx]] = valueWrapper;
            }
        }
        return obj;
    };
}
exports.buildValuesAndSeparateKeysToObjectMapper = buildValuesAndSeparateKeysToObjectMapper;
function buildValuesAndSeparateKeysToObjectUnmapper(keys, noKeyValue) {
    return function valuesAndSeparateKeysToObjectUnmapper(value) {
        if (typeof value !== 'object' || value === null) {
            throw new Error('Incompatible instance received: should be a non-null object');
        }
        if (!('constructor' in value) || value.constructor !== Object) {
            throw new Error('Incompatible instance received: should be of exact type Object');
        }
        let extractedPropertiesCount = 0;
        const extractedValues = [];
        for (let idx = 0; idx !== keys.length; ++idx) {
            const descriptor = Object.getOwnPropertyDescriptor(value, keys[idx]);
            if (descriptor !== undefined) {
                if (!descriptor.configurable || !descriptor.enumerable || !descriptor.writable) {
                    throw new Error('Incompatible instance received: should contain only c/e/w properties');
                }
                if (descriptor.get !== undefined || descriptor.set !== undefined) {
                    throw new Error('Incompatible instance received: should contain only no get/set properties');
                }
                ++extractedPropertiesCount;
                extractedValues.push(descriptor.value);
            }
            else {
                extractedValues.push(noKeyValue);
            }
        }
        const namePropertiesCount = Object.getOwnPropertyNames(value).length;
        const symbolPropertiesCount = Object.getOwnPropertySymbols(value).length;
        if (extractedPropertiesCount !== namePropertiesCount + symbolPropertiesCount) {
            throw new Error('Incompatible instance received: should not contain extra properties');
        }
        return extractedValues;
    };
}
exports.buildValuesAndSeparateKeysToObjectUnmapper = buildValuesAndSeparateKeysToObjectUnmapper;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEnumerableKeys = void 0;
function extractEnumerableKeys(instance) {
    const keys = Object.keys(instance);
    const symbols = Object.getOwnPropertySymbols(instance);
    for (let index = 0; index !== symbols.length; ++index) {
        const symbol = symbols[index];
        const descriptor = Object.getOwnPropertyDescriptor(instance, symbol);
        if (descriptor && descriptor.enumerable) {
            keys.push(symbol);
        }
    }
    return keys;
}
exports.extractEnumerableKeys = extractEnumerableKeys;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEvmType = void 0;
const isUIntTypeRegex = /^uint([0-9]*)$/;
const isIntTypeRegex = /^int([0-9]*)$/;
const isBytesTypeRegex = /^bytes([0-9]+)$/;
function parseEvmType(rawType, components, internalType) {
    const lastChar = rawType[rawType.length - 1];
    // first we parse array type
    if (lastChar === ']') {
        let finishArrayTypeIndex = rawType.length - 2;
        while (rawType[finishArrayTypeIndex] !== '[') {
            finishArrayTypeIndex--;
        }
        const arraySizeRaw = rawType.slice(finishArrayTypeIndex + 1, rawType.length - 1);
        const arraySize = arraySizeRaw !== '' ? parseInt(arraySizeRaw) : undefined;
        const restOfTheType = rawType.slice(0, finishArrayTypeIndex);
        return { type: 'array', itemType: parseEvmType(restOfTheType, components), size: arraySize, originalType: rawType };
    }
    // otherwise this has to be primitive type
    // deal with simple to parse types
    switch (rawType) {
        case 'bool':
            return { type: 'boolean', originalType: rawType };
        case 'address':
            return { type: 'address', originalType: rawType };
        case 'string':
            return { type: 'string', originalType: rawType };
        case 'byte':
            return { type: 'bytes', size: 1, originalType: rawType };
        case 'bytes':
            return { type: 'dynamic-bytes', originalType: rawType };
        case 'tuple':
            if (!components)
                throw new Error('Tuple specified without components!');
            return { type: 'tuple', components, originalType: rawType };
    }
    if (isUIntTypeRegex.test(rawType)) {
        const match = isUIntTypeRegex.exec(rawType);
        return { type: 'uinteger', bits: parseInt(match[1] || '256'), originalType: rawType };
    }
    if (isIntTypeRegex.test(rawType)) {
        const match = isIntTypeRegex.exec(rawType);
        return { type: 'integer', bits: parseInt(match[1] || '256'), originalType: rawType };
    }
    if (isBytesTypeRegex.test(rawType)) {
        const match = isBytesTypeRegex.exec(rawType);
        return { type: 'bytes', size: parseInt(match[1] || '1'), originalType: rawType };
    }
    if (internalType === null || internalType === void 0 ? void 0 : internalType.startsWith('enum')) {
        return parseEvmType('uint8');
    }
    throw new Error('Unknown type: ' + rawType);
}
exports.parseEvmType = parseEvmType;
//# sourceMappingURL=parseEvmType.js.map
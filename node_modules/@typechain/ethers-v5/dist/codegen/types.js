"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOutputTupleType = exports.generateTupleType = exports.generateOutputType = exports.generateInputType = exports.generateOutputTypes = exports.generateInputTypes = void 0;
function generateInputTypes(input) {
    if (input.length === 0) {
        return '';
    }
    return (input.map((input, index) => `${input.name || `arg${index}`}: ${generateInputType(input.type)}`).join(', ') + ', ');
}
exports.generateInputTypes = generateInputTypes;
function generateOutputTypes(returnResultObject, outputs) {
    if (!returnResultObject && outputs.length === 1) {
        return generateOutputType(outputs[0].type);
    }
    else {
        return `{
      ${outputs.map((t) => t.name && `${t.name}: ${generateOutputType(t.type)}, `).join('')}
      ${outputs.map((t, i) => `${i}: ${generateOutputType(t.type)}`).join(', ')}
      }`;
    }
}
exports.generateOutputTypes = generateOutputTypes;
// https://docs.ethers.io/ethers.js/html/api-contract.html#types
function generateInputType(evmType) {
    switch (evmType.type) {
        case 'integer':
            return 'BigNumberish';
        case 'uinteger':
            return 'BigNumberish';
        case 'address':
            return 'string';
        case 'bytes':
        case 'dynamic-bytes':
            return 'BytesLike';
        case 'array':
            if (evmType.size !== undefined) {
                return `[${Array(evmType.size).fill(generateInputType(evmType.itemType)).join(', ')}]`;
            }
            else {
                return `(${generateInputType(evmType.itemType)})[]`;
            }
        case 'boolean':
            return 'boolean';
        case 'string':
            return 'string';
        case 'tuple':
            return generateTupleType(evmType, generateInputType);
    }
}
exports.generateInputType = generateInputType;
function generateOutputType(evmType) {
    switch (evmType.type) {
        case 'integer':
        case 'uinteger':
            return evmType.bits <= 48 ? 'number' : 'BigNumber';
        case 'address':
            return 'string';
        case 'void':
            return 'void';
        case 'bytes':
        case 'dynamic-bytes':
            return 'string';
        case 'array':
            if (evmType.size !== undefined) {
                return `[${Array(evmType.size).fill(generateOutputType(evmType.itemType)).join(', ')}]`;
            }
            else {
                return `(${generateOutputType(evmType.itemType)})[]`;
            }
        case 'boolean':
            return 'boolean';
        case 'string':
            return 'string';
        case 'tuple':
            return generateOutputTupleType(evmType);
    }
}
exports.generateOutputType = generateOutputType;
function generateTupleType(tuple, generator) {
    return '{' + tuple.components.map((component) => `${component.name}: ${generator(component.type)}`).join(',') + '}';
}
exports.generateTupleType = generateTupleType;
function generateOutputTupleType(tuple) {
    return ('{' +
        tuple.components.map((component) => `${component.name}: ${generateOutputType(component.type)} ,`).join('\n') +
        tuple.components.map((component, index) => `${index}: ${generateOutputType(component.type)}`).join(', ') +
        '}');
}
exports.generateOutputTupleType = generateOutputTupleType;
//# sourceMappingURL=types.js.map
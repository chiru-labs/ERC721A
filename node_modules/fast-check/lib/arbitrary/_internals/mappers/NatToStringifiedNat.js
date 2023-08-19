"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.natToStringifiedNatUnmapper = exports.tryParseStringifiedNat = exports.natToStringifiedNatMapper = void 0;
function natToStringifiedNatMapper(options) {
    const [style, v] = options;
    switch (style) {
        case 'oct':
            return `0${Number(v).toString(8)}`;
        case 'hex':
            return `0x${Number(v).toString(16)}`;
        case 'dec':
        default:
            return `${v}`;
    }
}
exports.natToStringifiedNatMapper = natToStringifiedNatMapper;
function tryParseStringifiedNat(stringValue, radix) {
    const parsedNat = Number.parseInt(stringValue, radix);
    if (parsedNat.toString(radix) !== stringValue) {
        throw new Error('Invalid value');
    }
    return parsedNat;
}
exports.tryParseStringifiedNat = tryParseStringifiedNat;
function natToStringifiedNatUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    if (value.length >= 2 && value[0] === '0') {
        if (value[1] === 'x') {
            return ['hex', tryParseStringifiedNat(value.substr(2), 16)];
        }
        return ['oct', tryParseStringifiedNat(value.substr(1), 8)];
    }
    return ['dec', tryParseStringifiedNat(value, 10)];
}
exports.natToStringifiedNatUnmapper = natToStringifiedNatUnmapper;

export function numberToPaddedEightMapper(n) {
    return n.toString(16).padStart(8, '0');
}
export function numberToPaddedEightUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported type');
    }
    if (value.length !== 8) {
        throw new Error('Unsupported value: invalid length');
    }
    const n = parseInt(value, 16);
    if (value !== numberToPaddedEightMapper(n)) {
        throw new Error('Unsupported value: invalid content');
    }
    return n;
}

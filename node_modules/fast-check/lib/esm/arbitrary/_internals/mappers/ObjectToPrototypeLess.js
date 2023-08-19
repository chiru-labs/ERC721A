export function objectToPrototypeLessMapper(o) {
    return Object.assign(Object.create(null), o);
}
export function objectToPrototypeLessUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if ('__proto__' in value) {
        throw new Error('Incompatible instance received: should not have any __proto__');
    }
    return Object.assign({}, value);
}

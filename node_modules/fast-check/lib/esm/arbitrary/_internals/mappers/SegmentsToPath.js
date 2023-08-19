export function segmentsToPathMapper(segments) {
    return segments.map((v) => `/${v}`).join('');
}
export function segmentsToPathUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Incompatible value received: type');
    }
    if (value.length !== 0 && value[0] !== '/') {
        throw new Error('Incompatible value received: start');
    }
    return value.split('/').splice(1);
}

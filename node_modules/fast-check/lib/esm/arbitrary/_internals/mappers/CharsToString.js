export function charsToStringMapper(tab) {
    return tab.join('');
}
export function charsToStringUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Cannot unmap the passed value');
    }
    return value.split('');
}

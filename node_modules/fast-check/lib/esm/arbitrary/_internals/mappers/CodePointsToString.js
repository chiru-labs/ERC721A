export function codePointsToStringMapper(tab) {
    return tab.join('');
}
export function codePointsToStringUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Cannot unmap the passed value');
    }
    return [...value];
}

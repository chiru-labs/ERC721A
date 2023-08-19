export function timeToDateMapper(time) {
    return new Date(time);
}
export function timeToDateUnmapper(value) {
    if (!(value instanceof Date) || value.constructor !== Date) {
        throw new Error('Not a valid value for date unmapper');
    }
    return value.getTime();
}

import { stream } from '../../../stream/Stream.js';
export function pathWalk(path, initialValues, shrink) {
    let values = stream(initialValues);
    const segments = path.split(':').map((text) => +text);
    if (segments.length === 0)
        return values;
    if (!segments.every((v) => !Number.isNaN(v))) {
        throw new Error(`Unable to replay, got invalid path=${path}`);
    }
    values = values.drop(segments[0]);
    for (const s of segments.slice(1)) {
        const valueToShrink = values.getNthOrLast(0);
        if (valueToShrink == null) {
            throw new Error(`Unable to replay, got wrong path=${path}`);
        }
        values = shrink(valueToShrink).drop(s);
    }
    return values;
}

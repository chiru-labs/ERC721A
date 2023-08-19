"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathWalk = void 0;
const Stream_1 = require("../../../stream/Stream");
function pathWalk(path, initialValues, shrink) {
    let values = (0, Stream_1.stream)(initialValues);
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
exports.pathWalk = pathWalk;

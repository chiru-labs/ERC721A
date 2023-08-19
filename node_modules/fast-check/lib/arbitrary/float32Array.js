"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.float32Array = void 0;
const float_1 = require("./float");
const array_1 = require("./array");
const Converters_1 = require("../check/arbitrary/definition/Converters");
function toTypedMapper(data) {
    return Float32Array.from(data);
}
function fromTypedUnmapper(value) {
    if (!(value instanceof Float32Array))
        throw new Error('Unexpected type');
    return [...value];
}
function float32Array(constraints = {}) {
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, array_1.array)((0, float_1.float)(Object.assign(Object.assign({}, constraints), { next: true })), constraints)).map(toTypedMapper, fromTypedUnmapper));
}
exports.float32Array = float32Array;

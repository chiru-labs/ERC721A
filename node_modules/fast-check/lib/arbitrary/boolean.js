"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boolean = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const integer_1 = require("./integer");
function booleanMapper(v) {
    return v === 1;
}
function booleanUnmapper(v) {
    if (typeof v !== 'boolean')
        throw new Error('Unsupported input type');
    return v === true ? 1 : 0;
}
function boolean() {
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, integer_1.integer)({ min: 0, max: 1 }))
        .map(booleanMapper, booleanUnmapper)
        .noBias());
}
exports.boolean = boolean;

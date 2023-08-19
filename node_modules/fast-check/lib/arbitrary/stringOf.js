"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringOf = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const array_1 = require("./array");
const StringConstraintsExtractor_1 = require("./_internals/helpers/StringConstraintsExtractor");
const PatternsToString_1 = require("./_internals/mappers/PatternsToString");
function stringOf(charArb, ...args) {
    const constraints = (0, StringConstraintsExtractor_1.extractStringConstraints)(args);
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, array_1.array)(charArb, constraints)).map(PatternsToString_1.patternsToStringMapper, (0, PatternsToString_1.patternsToStringUnmapperFor)((0, Converters_1.convertToNext)(charArb), constraints)));
}
exports.stringOf = stringOf;

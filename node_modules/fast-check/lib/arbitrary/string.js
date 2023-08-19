"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const array_1 = require("./array");
const char_1 = require("./char");
const StringConstraintsExtractor_1 = require("./_internals/helpers/StringConstraintsExtractor");
const CodePointsToString_1 = require("./_internals/mappers/CodePointsToString");
function string(...args) {
    const constraints = (0, StringConstraintsExtractor_1.extractStringConstraints)(args);
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, array_1.array)((0, char_1.char)(), constraints)).map(CodePointsToString_1.codePointsToStringMapper, CodePointsToString_1.codePointsToStringUnmapper));
}
exports.string = string;

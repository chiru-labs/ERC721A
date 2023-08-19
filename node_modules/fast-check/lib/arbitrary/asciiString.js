"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asciiString = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const array_1 = require("./array");
const ascii_1 = require("./ascii");
const StringConstraintsExtractor_1 = require("./_internals/helpers/StringConstraintsExtractor");
const CodePointsToString_1 = require("./_internals/mappers/CodePointsToString");
function asciiString(...args) {
    const constraints = (0, StringConstraintsExtractor_1.extractStringConstraints)(args);
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, array_1.array)((0, ascii_1.ascii)(), constraints)).map(CodePointsToString_1.codePointsToStringMapper, CodePointsToString_1.codePointsToStringUnmapper));
}
exports.asciiString = asciiString;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string16bits = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const array_1 = require("./array");
const char16bits_1 = require("./char16bits");
const StringConstraintsExtractor_1 = require("./_internals/helpers/StringConstraintsExtractor");
const CharsToString_1 = require("./_internals/mappers/CharsToString");
function string16bits(...args) {
    const constraints = (0, StringConstraintsExtractor_1.extractStringConstraints)(args);
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, array_1.array)((0, char16bits_1.char16bits)(), constraints)).map(CharsToString_1.charsToStringMapper, CharsToString_1.charsToStringUnmapper));
}
exports.string16bits = string16bits;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCharacterArbitrary = void 0;
const Converters_1 = require("../../../check/arbitrary/definition/Converters");
const integer_1 = require("../../integer");
const IndexToCharString_1 = require("../mappers/IndexToCharString");
function buildCharacterArbitrary(min, max, mapToCode, unmapFromCode) {
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, integer_1.integer)(min, max)).map((n) => (0, IndexToCharString_1.indexToCharStringMapper)(mapToCode(n)), (c) => unmapFromCode((0, IndexToCharString_1.indexToCharStringUnmapper)(c))));
}
exports.buildCharacterArbitrary = buildCharacterArbitrary;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaddedNumberArbitrary = void 0;
const Converters_1 = require("../../../check/arbitrary/definition/Converters");
const integer_1 = require("../../integer");
const NumberToPaddedEight_1 = require("../mappers/NumberToPaddedEight");
function buildPaddedNumberArbitrary(min, max) {
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, integer_1.integer)({ min, max })).map(NumberToPaddedEight_1.numberToPaddedEightMapper, NumberToPaddedEight_1.numberToPaddedEightUnmapper));
}
exports.buildPaddedNumberArbitrary = buildPaddedNumberArbitrary;

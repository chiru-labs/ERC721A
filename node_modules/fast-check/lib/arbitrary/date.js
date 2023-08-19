"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.date = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const integer_1 = require("./integer");
const TimeToDate_1 = require("./_internals/mappers/TimeToDate");
function date(constraints) {
    const intMin = constraints && constraints.min !== undefined ? constraints.min.getTime() : -8640000000000000;
    const intMax = constraints && constraints.max !== undefined ? constraints.max.getTime() : 8640000000000000;
    if (Number.isNaN(intMin))
        throw new Error('fc.date min must be valid instance of Date');
    if (Number.isNaN(intMax))
        throw new Error('fc.date max must be valid instance of Date');
    if (intMin > intMax)
        throw new Error('fc.date max must be greater or equal to min');
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, integer_1.integer)(intMin, intMax)).map(TimeToDate_1.timeToDateMapper, TimeToDate_1.timeToDateUnmapper));
}
exports.date = date;

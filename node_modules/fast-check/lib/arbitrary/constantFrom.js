"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constantFrom = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const ConstantArbitrary_1 = require("./_internals/ConstantArbitrary");
function constantFrom(...values) {
    if (values.length === 0) {
        throw new Error('fc.constantFrom expects at least one parameter');
    }
    return (0, Converters_1.convertFromNext)(new ConstantArbitrary_1.ConstantArbitrary(values));
}
exports.constantFrom = constantFrom;

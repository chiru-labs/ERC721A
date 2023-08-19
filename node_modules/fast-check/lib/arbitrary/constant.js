"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constant = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const ConstantArbitrary_1 = require("./_internals/ConstantArbitrary");
function constant(value) {
    return (0, Converters_1.convertFromNext)(new ConstantArbitrary_1.ConstantArbitrary([value]));
}
exports.constant = constant;

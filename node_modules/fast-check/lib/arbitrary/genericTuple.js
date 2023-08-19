"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericTuple = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const TupleArbitrary_1 = require("./_internals/TupleArbitrary");
function genericTuple(arbs) {
    const nextArbs = arbs.map((arb) => (0, Converters_1.convertToNext)(arb));
    return (0, Converters_1.convertFromNext)(new TupleArbitrary_1.TupleArbitrary(nextArbs));
}
exports.genericTuple = genericTuple;

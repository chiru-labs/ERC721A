"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncProperty = void 0;
const genericTuple_1 = require("../../arbitrary/genericTuple");
const ConvertersProperty_1 = require("./ConvertersProperty");
const AsyncProperty_generic_1 = require("./AsyncProperty.generic");
const AlwaysShrinkableArbitrary_1 = require("../../arbitrary/_internals/AlwaysShrinkableArbitrary");
const Converters_1 = require("../arbitrary/definition/Converters");
function asyncProperty(...args) {
    if (args.length < 2)
        throw new Error('asyncProperty expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return (0, ConvertersProperty_1.convertFromNextAsyncPropertyWithHooks)(new AsyncProperty_generic_1.AsyncProperty((0, genericTuple_1.genericTuple)(arbs.map(arb => (0, Converters_1.convertFromNext)(new AlwaysShrinkableArbitrary_1.AlwaysShrinkableArbitrary((0, Converters_1.convertToNext)(arb))))), t => p(...t)));
}
exports.asyncProperty = asyncProperty;

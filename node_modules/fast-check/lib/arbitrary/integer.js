"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integer = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const IntegerArbitrary_1 = require("./_internals/IntegerArbitrary");
function buildCompleteIntegerConstraints(constraints) {
    const min = constraints.min !== undefined ? constraints.min : -0x80000000;
    const max = constraints.max !== undefined ? constraints.max : 0x7fffffff;
    return { min, max };
}
function extractIntegerConstraints(args) {
    if (args[0] === undefined) {
        return {};
    }
    if (args[1] === undefined) {
        const sargs = args;
        if (typeof sargs[0] === 'number')
            return { max: sargs[0] };
        return sargs[0];
    }
    const sargs = args;
    return { min: sargs[0], max: sargs[1] };
}
function integer(...args) {
    const constraints = buildCompleteIntegerConstraints(extractIntegerConstraints(args));
    if (constraints.min > constraints.max) {
        throw new Error('fc.integer maximum value should be equal or greater than the minimum one');
    }
    if (!Number.isInteger(constraints.min)) {
        throw new Error('fc.integer minimum value should be an integer');
    }
    if (!Number.isInteger(constraints.max)) {
        throw new Error('fc.integer maximum value should be an integer');
    }
    const arb = new IntegerArbitrary_1.IntegerArbitrary(constraints.min, constraints.max);
    return (0, Converters_1.convertFromNextWithShrunkOnce)(arb, arb.defaultTarget());
}
exports.integer = integer;

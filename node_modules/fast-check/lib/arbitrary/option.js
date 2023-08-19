"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.option = void 0;
const constant_1 = require("./constant");
const FrequencyArbitrary_1 = require("./_internals/FrequencyArbitrary");
function extractOptionConstraints(constraints) {
    if (typeof constraints === 'number')
        return { freq: constraints };
    if (!constraints)
        return {};
    return constraints;
}
function option(arb, rawConstraints) {
    const constraints = extractOptionConstraints(rawConstraints);
    const freq = constraints.freq == null ? 5 : constraints.freq;
    const nilValue = Object.prototype.hasOwnProperty.call(constraints, 'nil') ? constraints.nil : null;
    const nilArb = (0, constant_1.constant)(nilValue);
    const weightedArbs = [
        { arbitrary: nilArb, weight: 1, fallbackValue: { default: nilValue } },
        { arbitrary: arb, weight: freq },
    ];
    const frequencyConstraints = {
        withCrossShrink: true,
        depthFactor: constraints.depthFactor,
        maxDepth: constraints.maxDepth,
        depthIdentifier: constraints.depthIdentifier,
    };
    return FrequencyArbitrary_1.FrequencyArbitrary.fromOld(weightedArbs, frequencyConstraints, 'fc.option');
}
exports.option = option;

import { constant } from './constant.js';
import { FrequencyArbitrary } from './_internals/FrequencyArbitrary.js';
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
    const nilArb = constant(nilValue);
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
    return FrequencyArbitrary.fromOld(weightedArbs, frequencyConstraints, 'fc.option');
}
export { option };

import { NextArbitrary } from '../../check/arbitrary/definition/NextArbitrary.js';
import { NextValue } from '../../check/arbitrary/definition/NextValue.js';
import { cloneMethod } from '../../check/symbols.js';
import { Stream } from '../../stream/Stream.js';
import { asyncStringify, asyncToStringMethod, stringify, toStringMethod } from '../../utils/stringify.js';
function prettyPrint(seenValuesStrings) {
    return `Stream(${seenValuesStrings.join(',')}…)`;
}
export class StreamArbitrary extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng, biasFactor) {
        const appliedBiasFactor = biasFactor !== undefined && mrng.nextInt(1, biasFactor) === 1 ? biasFactor : undefined;
        const enrichedProducer = () => {
            const seenValues = [];
            const g = function* (arb, clonedMrng) {
                while (true) {
                    const value = arb.generate(clonedMrng, appliedBiasFactor).value;
                    seenValues.push(value);
                    yield value;
                }
            };
            const s = new Stream(g(this.arb, mrng.clone()));
            return Object.defineProperties(s, {
                toString: { value: () => prettyPrint(seenValues.map(stringify)) },
                [toStringMethod]: { value: () => prettyPrint(seenValues.map(stringify)) },
                [asyncToStringMethod]: { value: async () => prettyPrint(await Promise.all(seenValues.map(asyncStringify))) },
                [cloneMethod]: { value: enrichedProducer, enumerable: true },
            });
        };
        return new NextValue(enrichedProducer(), undefined);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(_value, _context) {
        return Stream.nil();
    }
}

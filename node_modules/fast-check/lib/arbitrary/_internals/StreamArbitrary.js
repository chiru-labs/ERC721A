"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamArbitrary = void 0;
const NextArbitrary_1 = require("../../check/arbitrary/definition/NextArbitrary");
const NextValue_1 = require("../../check/arbitrary/definition/NextValue");
const symbols_1 = require("../../check/symbols");
const Stream_1 = require("../../stream/Stream");
const stringify_1 = require("../../utils/stringify");
function prettyPrint(seenValuesStrings) {
    return `Stream(${seenValuesStrings.join(',')}…)`;
}
class StreamArbitrary extends NextArbitrary_1.NextArbitrary {
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
            const s = new Stream_1.Stream(g(this.arb, mrng.clone()));
            return Object.defineProperties(s, {
                toString: { value: () => prettyPrint(seenValues.map(stringify_1.stringify)) },
                [stringify_1.toStringMethod]: { value: () => prettyPrint(seenValues.map(stringify_1.stringify)) },
                [stringify_1.asyncToStringMethod]: { value: async () => prettyPrint(await Promise.all(seenValues.map(stringify_1.asyncStringify))) },
                [symbols_1.cloneMethod]: { value: enrichedProducer, enumerable: true },
            });
        };
        return new NextValue_1.NextValue(enrichedProducer(), undefined);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(_value, _context) {
        return Stream_1.Stream.nil();
    }
}
exports.StreamArbitrary = StreamArbitrary;

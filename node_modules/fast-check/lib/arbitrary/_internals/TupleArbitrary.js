"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TupleArbitrary = void 0;
const Stream_1 = require("../../stream/Stream");
const symbols_1 = require("../../check/symbols");
const NextArbitrary_1 = require("../../check/arbitrary/definition/NextArbitrary");
const NextValue_1 = require("../../check/arbitrary/definition/NextValue");
class TupleArbitrary extends NextArbitrary_1.NextArbitrary {
    constructor(arbs) {
        super();
        this.arbs = arbs;
        for (let idx = 0; idx !== arbs.length; ++idx) {
            const arb = arbs[idx];
            if (arb == null || arb.generate == null)
                throw new Error(`Invalid parameter encountered at index ${idx}: expecting an Arbitrary`);
        }
    }
    static makeItCloneable(vs, values) {
        return Object.defineProperty(vs, symbols_1.cloneMethod, {
            value: () => {
                const cloned = [];
                for (let idx = 0; idx !== values.length; ++idx) {
                    cloned.push(values[idx].value);
                }
                TupleArbitrary.makeItCloneable(cloned, values);
                return cloned;
            },
        });
    }
    static wrapper(values) {
        let cloneable = false;
        const vs = [];
        const ctxs = [];
        for (let idx = 0; idx !== values.length; ++idx) {
            const v = values[idx];
            cloneable = cloneable || v.hasToBeCloned;
            vs.push(v.value);
            ctxs.push(v.context);
        }
        if (cloneable) {
            TupleArbitrary.makeItCloneable(vs, values);
        }
        return new NextValue_1.NextValue(vs, ctxs);
    }
    generate(mrng, biasFactor) {
        return TupleArbitrary.wrapper(this.arbs.map((a) => a.generate(mrng, biasFactor)));
    }
    canShrinkWithoutContext(value) {
        if (!Array.isArray(value) || value.length !== this.arbs.length) {
            return false;
        }
        for (let index = 0; index !== this.arbs.length; ++index) {
            if (!this.arbs[index].canShrinkWithoutContext(value[index])) {
                return false;
            }
        }
        return true;
    }
    shrink(value, context) {
        let s = Stream_1.Stream.nil();
        const safeContext = Array.isArray(context) ? context : [];
        for (let idx = 0; idx !== this.arbs.length; ++idx) {
            const shrinksForIndex = this.arbs[idx]
                .shrink(value[idx], safeContext[idx])
                .map((v) => {
                const nextValues = value.map((v, idx) => new NextValue_1.NextValue((0, symbols_1.cloneIfNeeded)(v), safeContext[idx]));
                return nextValues
                    .slice(0, idx)
                    .concat([v])
                    .concat(nextValues.slice(idx + 1));
            })
                .map((values) => TupleArbitrary.wrapper(values));
            s = s.join(shrinksForIndex);
        }
        return s;
    }
}
exports.TupleArbitrary = TupleArbitrary;

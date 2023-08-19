import { Stream } from '../../stream/Stream.js';
import { cloneIfNeeded, cloneMethod } from '../../check/symbols.js';
import { NextArbitrary } from '../../check/arbitrary/definition/NextArbitrary.js';
import { NextValue } from '../../check/arbitrary/definition/NextValue.js';
export class TupleArbitrary extends NextArbitrary {
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
        return Object.defineProperty(vs, cloneMethod, {
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
        return new NextValue(vs, ctxs);
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
        let s = Stream.nil();
        const safeContext = Array.isArray(context) ? context : [];
        for (let idx = 0; idx !== this.arbs.length; ++idx) {
            const shrinksForIndex = this.arbs[idx]
                .shrink(value[idx], safeContext[idx])
                .map((v) => {
                const nextValues = value.map((v, idx) => new NextValue(cloneIfNeeded(v), safeContext[idx]));
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

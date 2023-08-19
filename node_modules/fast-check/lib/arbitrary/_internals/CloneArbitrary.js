"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneArbitrary = void 0;
const NextArbitrary_1 = require("../../check/arbitrary/definition/NextArbitrary");
const NextValue_1 = require("../../check/arbitrary/definition/NextValue");
const symbols_1 = require("../../check/symbols");
const Stream_1 = require("../../stream/Stream");
class CloneArbitrary extends NextArbitrary_1.NextArbitrary {
    constructor(arb, numValues) {
        super();
        this.arb = arb;
        this.numValues = numValues;
    }
    generate(mrng, biasFactor) {
        const items = [];
        if (this.numValues <= 0) {
            return this.wrapper(items);
        }
        for (let idx = 0; idx !== this.numValues - 1; ++idx) {
            items.push(this.arb.generate(mrng.clone(), biasFactor));
        }
        items.push(this.arb.generate(mrng, biasFactor));
        return this.wrapper(items);
    }
    canShrinkWithoutContext(value) {
        if (!Array.isArray(value) || value.length !== this.numValues) {
            return false;
        }
        if (value.length === 0) {
            return true;
        }
        for (let index = 1; index < value.length; ++index) {
            if (!Object.is(value[0], value[index])) {
                return false;
            }
        }
        return this.arb.canShrinkWithoutContext(value[0]);
    }
    shrink(value, context) {
        if (value.length === 0) {
            return Stream_1.Stream.nil();
        }
        return new Stream_1.Stream(this.shrinkImpl(value, context !== undefined ? context : [])).map((v) => this.wrapper(v));
    }
    *shrinkImpl(value, contexts) {
        const its = value.map((v, idx) => this.arb.shrink(v, contexts[idx])[Symbol.iterator]());
        let cur = its.map((it) => it.next());
        while (!cur[0].done) {
            yield cur.map((c) => c.value);
            cur = its.map((it) => it.next());
        }
    }
    static makeItCloneable(vs, shrinkables) {
        vs[symbols_1.cloneMethod] = () => {
            const cloned = [];
            for (let idx = 0; idx !== shrinkables.length; ++idx) {
                cloned.push(shrinkables[idx].value);
            }
            this.makeItCloneable(cloned, shrinkables);
            return cloned;
        };
        return vs;
    }
    wrapper(items) {
        let cloneable = false;
        const vs = [];
        const contexts = [];
        for (let idx = 0; idx !== items.length; ++idx) {
            const s = items[idx];
            cloneable = cloneable || s.hasToBeCloned;
            vs.push(s.value);
            contexts.push(s.context);
        }
        if (cloneable) {
            CloneArbitrary.makeItCloneable(vs, items);
        }
        return new NextValue_1.NextValue(vs, contexts);
    }
}
exports.CloneArbitrary = CloneArbitrary;

"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConverterFromNext = void 0;
const ArbitraryWithContextualShrink_1 = require("./ArbitraryWithContextualShrink");
const ConverterToNext_1 = require("./ConverterToNext");
const Shrinkable_1 = require("./Shrinkable");
const identifier = '__ConverterFromNext__';
function fromNextValueToShrinkableFor(arb) {
    return function fromNextValueToShrinkable(v) {
        const value_ = v.value_;
        const shrinker = () => arb.shrink(value_, v.context).map(fromNextValueToShrinkable);
        if (!v.hasToBeCloned) {
            return new Shrinkable_1.Shrinkable(value_, shrinker);
        }
        return new Shrinkable_1.Shrinkable(value_, shrinker, () => v.value);
    };
}
class ConverterFromNext extends ArbitraryWithContextualShrink_1.ArbitraryWithContextualShrink {
    constructor(arb, legacyShrunkOnceContext, biasFactor = undefined) {
        super();
        this.arb = arb;
        this.legacyShrunkOnceContext = legacyShrunkOnceContext;
        this.biasFactor = biasFactor;
        this[_a] = true;
        this.toShrinkable = fromNextValueToShrinkableFor(arb);
    }
    static isConverterFromNext(arb) {
        return identifier in arb;
    }
    static convertIfNeeded(arb) {
        if (ConverterToNext_1.ConverterToNext.isConverterToNext(arb))
            return arb.arb;
        else
            return new ConverterFromNext(arb);
    }
    generate(mrng) {
        const g = this.arb.generate(mrng, this.biasFactor);
        return this.toShrinkable(g);
    }
    contextualShrink(value, context) {
        return this.arb.shrink(value, context).map((v) => [v.value_, v.context]);
    }
    shrunkOnceContext() {
        return this.legacyShrunkOnceContext;
    }
    filter(refinement) {
        return ConverterFromNext.convertIfNeeded(this.arb.filter(refinement));
    }
    map(mapper) {
        return ConverterFromNext.convertIfNeeded(this.arb.map(mapper));
    }
    chain(fmapper) {
        return ConverterFromNext.convertIfNeeded(this.arb.chain((t) => {
            const fmapped = fmapper(t);
            if (ConverterFromNext.isConverterFromNext(fmapped))
                return fmapped.arb;
            else
                return new ConverterToNext_1.ConverterToNext(fmapped);
        }));
    }
    noShrink() {
        return ConverterFromNext.convertIfNeeded(this.arb.noShrink());
    }
    withBias(freq) {
        return new ConverterFromNext(this.arb, this.legacyShrunkOnceContext, freq);
    }
    noBias() {
        return ConverterFromNext.convertIfNeeded(this.arb.noBias());
    }
}
exports.ConverterFromNext = ConverterFromNext;
_a = identifier;

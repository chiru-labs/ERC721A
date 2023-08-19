"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConverterToNext = exports.fromShrinkableToNextValue = void 0;
const Stream_1 = require("../../../stream/Stream");
const ConverterFromNext_1 = require("./ConverterFromNext");
const NextArbitrary_1 = require("./NextArbitrary");
const NextValue_1 = require("./NextValue");
const identifier = '__ConverterToNext__';
function fromShrinkableToNextValue(g) {
    if (!g.hasToBeCloned) {
        return new NextValue_1.NextValue(g.value_, g);
    }
    return new NextValue_1.NextValue(g.value_, g, () => g.value);
}
exports.fromShrinkableToNextValue = fromShrinkableToNextValue;
class ConverterToNext extends NextArbitrary_1.NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
        this[_a] = true;
    }
    static isConverterToNext(arb) {
        return identifier in arb;
    }
    static convertIfNeeded(arb) {
        if (ConverterFromNext_1.ConverterFromNext.isConverterFromNext(arb))
            return arb.arb;
        else
            return new ConverterToNext(arb);
    }
    generate(mrng, biasFactor) {
        const g = biasFactor !== undefined ? this.arb.withBias(biasFactor).generate(mrng) : this.arb.generate(mrng);
        return fromShrinkableToNextValue(g);
    }
    canShrinkWithoutContext(_value) {
        return false;
    }
    shrink(_value, context) {
        if (this.isSafeContext(context)) {
            return context.shrink().map(fromShrinkableToNextValue);
        }
        return Stream_1.Stream.nil();
    }
    isSafeContext(context) {
        return (context != null && typeof context === 'object' && 'value' in context && 'shrink' in context);
    }
    filter(refinement) {
        return ConverterToNext.convertIfNeeded(this.arb.filter(refinement));
    }
    map(mapper) {
        return ConverterToNext.convertIfNeeded(this.arb.map(mapper));
    }
    chain(fmapper) {
        return ConverterToNext.convertIfNeeded(this.arb.chain((t) => {
            const fmapped = fmapper(t);
            if (ConverterToNext.isConverterToNext(fmapped))
                return fmapped.arb;
            else
                return new ConverterFromNext_1.ConverterFromNext(fmapped);
        }));
    }
    noShrink() {
        return ConverterToNext.convertIfNeeded(this.arb.noShrink());
    }
    noBias() {
        return ConverterToNext.convertIfNeeded(this.arb.noBias());
    }
}
exports.ConverterToNext = ConverterToNext;
_a = identifier;

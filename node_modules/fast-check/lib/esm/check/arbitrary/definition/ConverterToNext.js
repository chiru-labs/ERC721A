var _a;
import { Stream } from '../../../stream/Stream.js';
import { ConverterFromNext } from './ConverterFromNext.js';
import { NextArbitrary } from './NextArbitrary.js';
import { NextValue } from './NextValue.js';
const identifier = '__ConverterToNext__';
export function fromShrinkableToNextValue(g) {
    if (!g.hasToBeCloned) {
        return new NextValue(g.value_, g);
    }
    return new NextValue(g.value_, g, () => g.value);
}
export class ConverterToNext extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
        this[_a] = true;
    }
    static isConverterToNext(arb) {
        return identifier in arb;
    }
    static convertIfNeeded(arb) {
        if (ConverterFromNext.isConverterFromNext(arb))
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
        return Stream.nil();
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
                return new ConverterFromNext(fmapped);
        }));
    }
    noShrink() {
        return ConverterToNext.convertIfNeeded(this.arb.noShrink());
    }
    noBias() {
        return ConverterToNext.convertIfNeeded(this.arb.noBias());
    }
}
_a = identifier;

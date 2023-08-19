import { assertIsArbitrary } from './Arbitrary.js';
import { ConverterFromNext } from './ConverterFromNext.js';
import { ConverterToNext } from './ConverterToNext.js';
import { assertIsNextArbitrary } from './NextArbitrary.js';
export function convertFromNext(arb) {
    if (ConverterToNext.isConverterToNext(arb)) {
        return arb.arb;
    }
    assertIsNextArbitrary(arb);
    return new ConverterFromNext(arb);
}
export function convertFromNextWithShrunkOnce(arb, legacyShrunkOnceContext) {
    if (ConverterToNext.isConverterToNext(arb)) {
        if (!('contextualShrink' in arb.arb) ||
            !('contextualShrinkableFor' in arb.arb) ||
            !('shrunkOnceContext' in arb.arb) ||
            !('shrink' in arb.arb) ||
            !('shrinkableFor' in arb.arb)) {
            throw new Error('Conversion rejected: Underlying arbitrary is not compatible with ArbitraryWithContextualShrink');
        }
        return arb.arb;
    }
    assertIsNextArbitrary(arb);
    return new ConverterFromNext(arb, legacyShrunkOnceContext);
}
export function convertToNext(arb) {
    if (ConverterFromNext.isConverterFromNext(arb)) {
        return arb.arb;
    }
    assertIsArbitrary(arb);
    return new ConverterToNext(arb);
}

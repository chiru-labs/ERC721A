"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToNext = exports.convertFromNextWithShrunkOnce = exports.convertFromNext = void 0;
const Arbitrary_1 = require("./Arbitrary");
const ConverterFromNext_1 = require("./ConverterFromNext");
const ConverterToNext_1 = require("./ConverterToNext");
const NextArbitrary_1 = require("./NextArbitrary");
function convertFromNext(arb) {
    if (ConverterToNext_1.ConverterToNext.isConverterToNext(arb)) {
        return arb.arb;
    }
    (0, NextArbitrary_1.assertIsNextArbitrary)(arb);
    return new ConverterFromNext_1.ConverterFromNext(arb);
}
exports.convertFromNext = convertFromNext;
function convertFromNextWithShrunkOnce(arb, legacyShrunkOnceContext) {
    if (ConverterToNext_1.ConverterToNext.isConverterToNext(arb)) {
        if (!('contextualShrink' in arb.arb) ||
            !('contextualShrinkableFor' in arb.arb) ||
            !('shrunkOnceContext' in arb.arb) ||
            !('shrink' in arb.arb) ||
            !('shrinkableFor' in arb.arb)) {
            throw new Error('Conversion rejected: Underlying arbitrary is not compatible with ArbitraryWithContextualShrink');
        }
        return arb.arb;
    }
    (0, NextArbitrary_1.assertIsNextArbitrary)(arb);
    return new ConverterFromNext_1.ConverterFromNext(arb, legacyShrunkOnceContext);
}
exports.convertFromNextWithShrunkOnce = convertFromNextWithShrunkOnce;
function convertToNext(arb) {
    if (ConverterFromNext_1.ConverterFromNext.isConverterFromNext(arb)) {
        return arb.arb;
    }
    (0, Arbitrary_1.assertIsArbitrary)(arb);
    return new ConverterToNext_1.ConverterToNext(arb);
}
exports.convertToNext = convertToNext;

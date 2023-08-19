"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegerArbitrary = void 0;
const NextArbitrary_1 = require("../../check/arbitrary/definition/NextArbitrary");
const NextValue_1 = require("../../check/arbitrary/definition/NextValue");
const Stream_1 = require("../../stream/Stream");
const BiasNumericRange_1 = require("./helpers/BiasNumericRange");
const ShrinkInteger_1 = require("./helpers/ShrinkInteger");
class IntegerArbitrary extends NextArbitrary_1.NextArbitrary {
    constructor(min, max) {
        super();
        this.min = min;
        this.max = max;
    }
    generate(mrng, biasFactor) {
        const range = this.computeGenerateRange(mrng, biasFactor);
        return new NextValue_1.NextValue(mrng.nextInt(range.min, range.max), undefined);
    }
    canShrinkWithoutContext(value) {
        return (typeof value === 'number' &&
            Number.isInteger(value) &&
            !Object.is(value, -0) &&
            this.min <= value &&
            value <= this.max);
    }
    shrink(current, context) {
        if (!IntegerArbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return (0, ShrinkInteger_1.shrinkInteger)(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream_1.Stream.of(new NextValue_1.NextValue(context, undefined));
        }
        return (0, ShrinkInteger_1.shrinkInteger)(current, context, false);
    }
    defaultTarget() {
        if (this.min <= 0 && this.max >= 0) {
            return 0;
        }
        return this.min < 0 ? this.max : this.min;
    }
    computeGenerateRange(mrng, biasFactor) {
        if (biasFactor === undefined || mrng.nextInt(1, biasFactor) !== 1) {
            return { min: this.min, max: this.max };
        }
        const ranges = (0, BiasNumericRange_1.biasNumericRange)(this.min, this.max, BiasNumericRange_1.integerLogLike);
        if (ranges.length === 1) {
            return ranges[0];
        }
        const id = mrng.nextInt(-2 * (ranges.length - 1), ranges.length - 2);
        return id < 0 ? ranges[0] : ranges[id + 1];
    }
    isLastChanceTry(current, context) {
        if (current > 0)
            return current === context + 1 && current > this.min;
        if (current < 0)
            return current === context - 1 && current < this.max;
        return false;
    }
    static isValidContext(current, context) {
        if (context === undefined) {
            return false;
        }
        if (typeof context !== 'number') {
            throw new Error(`Invalid context type passed to IntegerArbitrary (#1)`);
        }
        if (context !== 0 && Math.sign(current) !== Math.sign(context)) {
            throw new Error(`Invalid context value passed to IntegerArbitrary (#2)`);
        }
        return true;
    }
}
exports.IntegerArbitrary = IntegerArbitrary;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantArbitrary = void 0;
const Stream_1 = require("../../stream/Stream");
const NextArbitrary_1 = require("../../check/arbitrary/definition/NextArbitrary");
const NextValue_1 = require("../../check/arbitrary/definition/NextValue");
const symbols_1 = require("../../check/symbols");
class ConstantArbitrary extends NextArbitrary_1.NextArbitrary {
    constructor(values) {
        super();
        this.values = values;
    }
    generate(mrng, _biasFactor) {
        const idx = this.values.length === 1 ? 0 : mrng.nextInt(0, this.values.length - 1);
        const value = this.values[idx];
        if (!(0, symbols_1.hasCloneMethod)(value)) {
            return new NextValue_1.NextValue(value, idx);
        }
        return new NextValue_1.NextValue(value, idx, () => value[symbols_1.cloneMethod]());
    }
    canShrinkWithoutContext(value) {
        for (let idx = 0; idx !== this.values.length; ++idx) {
            if (Object.is(this.values[idx], value)) {
                return true;
            }
        }
        return false;
    }
    shrink(value, context) {
        if (context === 0 || Object.is(value, this.values[0])) {
            return Stream_1.Stream.nil();
        }
        return Stream_1.Stream.of(new NextValue_1.NextValue(this.values[0], 0));
    }
}
exports.ConstantArbitrary = ConstantArbitrary;

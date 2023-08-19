import { Stream } from '../../stream/Stream.js';
import { NextArbitrary } from '../../check/arbitrary/definition/NextArbitrary.js';
import { NextValue } from '../../check/arbitrary/definition/NextValue.js';
import { cloneMethod, hasCloneMethod } from '../../check/symbols.js';
export class ConstantArbitrary extends NextArbitrary {
    constructor(values) {
        super();
        this.values = values;
    }
    generate(mrng, _biasFactor) {
        const idx = this.values.length === 1 ? 0 : mrng.nextInt(0, this.values.length - 1);
        const value = this.values[idx];
        if (!hasCloneMethod(value)) {
            return new NextValue(value, idx);
        }
        return new NextValue(value, idx, () => value[cloneMethod]());
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
            return Stream.nil();
        }
        return Stream.of(new NextValue(this.values[0], 0));
    }
}

import { Arbitrary } from './Arbitrary.js';
import { Shrinkable } from './Shrinkable.js';
function removeContextFromContextualValue(contextualValue) {
    return contextualValue[0];
}
class ArbitraryWithContextualShrink extends Arbitrary {
    contextualShrinkableFor(value, context) {
        return new Shrinkable(value, () => this.contextualShrink(value, context).map((contextualValue) => this.contextualShrinkableFor(contextualValue[0], contextualValue[1])));
    }
    shrink(value, shrunkOnce) {
        const context = shrunkOnce === true ? this.shrunkOnceContext() : undefined;
        return this.contextualShrink(value, context).map(removeContextFromContextualValue);
    }
    shrinkableFor(value, shrunkOnce) {
        return new Shrinkable(value, () => {
            return this.shrink(value, shrunkOnce).map((value) => this.shrinkableFor(value, true));
        });
    }
}
export { ArbitraryWithContextualShrink };

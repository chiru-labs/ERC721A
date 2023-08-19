"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbitraryWithContextualShrink = void 0;
const Arbitrary_1 = require("./Arbitrary");
const Shrinkable_1 = require("./Shrinkable");
function removeContextFromContextualValue(contextualValue) {
    return contextualValue[0];
}
class ArbitraryWithContextualShrink extends Arbitrary_1.Arbitrary {
    contextualShrinkableFor(value, context) {
        return new Shrinkable_1.Shrinkable(value, () => this.contextualShrink(value, context).map((contextualValue) => this.contextualShrinkableFor(contextualValue[0], contextualValue[1])));
    }
    shrink(value, shrunkOnce) {
        const context = shrunkOnce === true ? this.shrunkOnceContext() : undefined;
        return this.contextualShrink(value, context).map(removeContextFromContextualValue);
    }
    shrinkableFor(value, shrunkOnce) {
        return new Shrinkable_1.Shrinkable(value, () => {
            return this.shrink(value, shrunkOnce).map((value) => this.shrinkableFor(value, true));
        });
    }
}
exports.ArbitraryWithContextualShrink = ArbitraryWithContextualShrink;

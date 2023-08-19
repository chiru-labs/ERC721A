"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbitraryWithShrink = void 0;
const Arbitrary_1 = require("./Arbitrary");
const Shrinkable_1 = require("./Shrinkable");
class ArbitraryWithShrink extends Arbitrary_1.Arbitrary {
    shrinkableFor(value, shrunkOnce) {
        return new Shrinkable_1.Shrinkable(value, () => this.shrink(value, shrunkOnce === true).map((v) => this.shrinkableFor(v, true)));
    }
}
exports.ArbitraryWithShrink = ArbitraryWithShrink;

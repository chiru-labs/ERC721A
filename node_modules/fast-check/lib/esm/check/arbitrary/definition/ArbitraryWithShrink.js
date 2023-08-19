import { Arbitrary } from './Arbitrary.js';
import { Shrinkable } from './Shrinkable.js';
class ArbitraryWithShrink extends Arbitrary {
    shrinkableFor(value, shrunkOnce) {
        return new Shrinkable(value, () => this.shrink(value, shrunkOnce === true).map((v) => this.shrinkableFor(v, true)));
    }
}
export { ArbitraryWithShrink };

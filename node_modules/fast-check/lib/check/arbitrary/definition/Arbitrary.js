"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsArbitrary = exports.Arbitrary = void 0;
const Shrinkable_1 = require("./Shrinkable");
class Arbitrary {
    filter(refinement) {
        return new FilterArbitrary(this, refinement);
    }
    map(mapper) {
        return new MapArbitrary(this, mapper);
    }
    chain(fmapper) {
        return new ChainArbitrary(this, fmapper);
    }
    noShrink() {
        return new NoShrinkArbitrary(this);
    }
    withBias(_freq) {
        return this;
    }
    noBias() {
        return new NoBiasArbitrary(this);
    }
}
exports.Arbitrary = Arbitrary;
class ChainArbitrary extends Arbitrary {
    constructor(arb, fmapper) {
        super();
        this.arb = arb;
        this.fmapper = fmapper;
    }
    generate(mrng) {
        const clonedMrng = mrng.clone();
        const src = this.arb.generate(mrng);
        const dst = this.fmapper(src.value).generate(mrng);
        return ChainArbitrary.shrinkChain(clonedMrng, src, dst, this.fmapper);
    }
    withBias(freq) {
        return this.arb.withBias(freq).chain((t) => this.fmapper(t).withBias(freq));
    }
    static shrinkChain(mrng, src, dst, fmapper) {
        return new Shrinkable_1.Shrinkable(dst.value, () => src
            .shrink()
            .map((v) => ChainArbitrary.shrinkChain(mrng.clone(), v, fmapper(v.value).generate(mrng.clone()), fmapper))
            .join(dst.shrink()));
    }
}
class MapArbitrary extends Arbitrary {
    constructor(arb, mapper) {
        super();
        this.arb = arb;
        this.mapper = mapper;
    }
    generate(mrng) {
        return this.arb.generate(mrng).map(this.mapper);
    }
    withBias(freq) {
        return this.arb.withBias(freq).map(this.mapper);
    }
}
class FilterArbitrary extends Arbitrary {
    constructor(arb, refinement) {
        super();
        this.arb = arb;
        this.refinement = refinement;
    }
    generate(mrng) {
        let g = this.arb.generate(mrng);
        while (!this.refinementOnShrinkable(g)) {
            g = this.arb.generate(mrng);
        }
        return g.filter(this.refinement);
    }
    withBias(freq) {
        return this.arb.withBias(freq).filter(this.refinement);
    }
    refinementOnShrinkable(s) {
        return this.refinement(s.value);
    }
}
class NoShrinkArbitrary extends Arbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng) {
        return new Shrinkable_1.Shrinkable(this.arb.generate(mrng).value);
    }
    withBias(freq) {
        return this.arb.withBias(freq).noShrink();
    }
}
class NoBiasArbitrary extends Arbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng) {
        return this.arb.generate(mrng);
    }
}
function assertIsArbitrary(instance) {
    if (typeof instance !== 'object' || instance === null || !('generate' in instance)) {
        throw new Error('Unexpected value received: not an instance of Arbitrary');
    }
}
exports.assertIsArbitrary = assertIsArbitrary;

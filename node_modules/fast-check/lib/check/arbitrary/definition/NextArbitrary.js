"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsNextArbitrary = exports.NextArbitrary = void 0;
const Stream_1 = require("../../../stream/Stream");
const symbols_1 = require("../../symbols");
const NextValue_1 = require("./NextValue");
class NextArbitrary {
    filter(refinement) {
        return new FilterArbitrary(this, refinement);
    }
    map(mapper, unmapper) {
        return new MapArbitrary(this, mapper, unmapper);
    }
    chain(chainer) {
        return new ChainArbitrary(this, chainer);
    }
    noShrink() {
        return new NoShrinkArbitrary(this);
    }
    noBias() {
        return new NoBiasArbitrary(this);
    }
}
exports.NextArbitrary = NextArbitrary;
class ChainArbitrary extends NextArbitrary {
    constructor(arb, chainer) {
        super();
        this.arb = arb;
        this.chainer = chainer;
    }
    generate(mrng, biasFactor) {
        const clonedMrng = mrng.clone();
        const src = this.arb.generate(mrng, biasFactor);
        return this.valueChainer(src, mrng, clonedMrng, biasFactor);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(value, context) {
        if (this.isSafeContext(context)) {
            return (!context.stoppedForOriginal
                ? this.arb
                    .shrink(context.originalValue, context.originalContext)
                    .map((v) => this.valueChainer(v, context.clonedMrng.clone(), context.clonedMrng, context.originalBias))
                : Stream_1.Stream.nil()).join(context.chainedArbitrary.shrink(value, context.chainedContext).map((dst) => {
                const newContext = Object.assign(Object.assign({}, context), { chainedContext: dst.context, stoppedForOriginal: true });
                return new NextValue_1.NextValue(dst.value_, newContext);
            }));
        }
        return Stream_1.Stream.nil();
    }
    valueChainer(v, generateMrng, clonedMrng, biasFactor) {
        const chainedArbitrary = this.chainer(v.value_);
        const dst = chainedArbitrary.generate(generateMrng, biasFactor);
        const context = {
            originalBias: biasFactor,
            originalValue: v.value_,
            originalContext: v.context,
            stoppedForOriginal: false,
            chainedArbitrary,
            chainedContext: dst.context,
            clonedMrng,
        };
        return new NextValue_1.NextValue(dst.value_, context);
    }
    isSafeContext(context) {
        return (context != null &&
            typeof context === 'object' &&
            'originalBias' in context &&
            'originalValue' in context &&
            'originalContext' in context &&
            'stoppedForOriginal' in context &&
            'chainedArbitrary' in context &&
            'chainedContext' in context &&
            'clonedMrng' in context);
    }
}
class MapArbitrary extends NextArbitrary {
    constructor(arb, mapper, unmapper) {
        super();
        this.arb = arb;
        this.mapper = mapper;
        this.unmapper = unmapper;
        this.bindValueMapper = this.valueMapper.bind(this);
    }
    generate(mrng, biasFactor) {
        const g = this.arb.generate(mrng, biasFactor);
        return this.valueMapper(g);
    }
    canShrinkWithoutContext(value) {
        if (this.unmapper !== undefined) {
            try {
                const unmapped = this.unmapper(value);
                return this.arb.canShrinkWithoutContext(unmapped);
            }
            catch (_err) {
                return false;
            }
        }
        return false;
    }
    shrink(value, context) {
        if (this.isSafeContext(context)) {
            return this.arb.shrink(context.originalValue, context.originalContext).map(this.bindValueMapper);
        }
        if (this.unmapper !== undefined) {
            const unmapped = this.unmapper(value);
            return this.arb.shrink(unmapped, undefined).map(this.bindValueMapper);
        }
        return Stream_1.Stream.nil();
    }
    mapperWithCloneIfNeeded(v) {
        const sourceValue = v.value;
        const mappedValue = this.mapper(sourceValue);
        if (v.hasToBeCloned &&
            ((typeof mappedValue === 'object' && mappedValue !== null) || typeof mappedValue === 'function') &&
            Object.isExtensible(mappedValue) &&
            !(0, symbols_1.hasCloneMethod)(mappedValue)) {
            Object.defineProperty(mappedValue, symbols_1.cloneMethod, { get: () => () => this.mapperWithCloneIfNeeded(v)[0] });
        }
        return [mappedValue, sourceValue];
    }
    valueMapper(v) {
        const [mappedValue, sourceValue] = this.mapperWithCloneIfNeeded(v);
        const context = { originalValue: sourceValue, originalContext: v.context };
        return new NextValue_1.NextValue(mappedValue, context);
    }
    isSafeContext(context) {
        return (context != null &&
            typeof context === 'object' &&
            'originalValue' in context &&
            'originalContext' in context);
    }
}
class FilterArbitrary extends NextArbitrary {
    constructor(arb, refinement) {
        super();
        this.arb = arb;
        this.refinement = refinement;
        this.bindRefinementOnValue = this.refinementOnValue.bind(this);
    }
    generate(mrng, biasFactor) {
        while (true) {
            const g = this.arb.generate(mrng, biasFactor);
            if (this.refinementOnValue(g)) {
                return g;
            }
        }
    }
    canShrinkWithoutContext(value) {
        return this.arb.canShrinkWithoutContext(value) && this.refinement(value);
    }
    shrink(value, context) {
        return this.arb.shrink(value, context).filter(this.bindRefinementOnValue);
    }
    refinementOnValue(v) {
        return this.refinement(v.value);
    }
}
class NoShrinkArbitrary extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng, biasFactor) {
        return this.arb.generate(mrng, biasFactor);
    }
    canShrinkWithoutContext(value) {
        return this.arb.canShrinkWithoutContext(value);
    }
    shrink(_value, _context) {
        return Stream_1.Stream.nil();
    }
    noShrink() {
        return this;
    }
}
class NoBiasArbitrary extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng, _biasFactor) {
        return this.arb.generate(mrng, undefined);
    }
    canShrinkWithoutContext(value) {
        return this.arb.canShrinkWithoutContext(value);
    }
    shrink(value, context) {
        return this.arb.shrink(value, context);
    }
    noBias() {
        return this;
    }
}
function assertIsNextArbitrary(instance) {
    if (typeof instance !== 'object' ||
        instance === null ||
        !('generate' in instance) ||
        !('shrink' in instance) ||
        'shrinkableFor' in instance) {
        throw new Error('Unexpected value received: not an instance of NextArbitrary');
    }
}
exports.assertIsNextArbitrary = assertIsNextArbitrary;

import { Stream } from '../../stream/Stream.js';
import { convertFromNext, convertToNext } from '../../check/arbitrary/definition/Converters.js';
import { NextArbitrary } from '../../check/arbitrary/definition/NextArbitrary.js';
import { NextValue } from '../../check/arbitrary/definition/NextValue.js';
import { getDepthContextFor } from './helpers/DepthContext.js';
export class FrequencyArbitrary extends NextArbitrary {
    constructor(warbs, constraints, context) {
        super();
        this.warbs = warbs;
        this.constraints = constraints;
        this.context = context;
        let currentWeight = 0;
        this.cumulatedWeights = [];
        for (let idx = 0; idx !== warbs.length; ++idx) {
            currentWeight += warbs[idx].weight;
            this.cumulatedWeights.push(currentWeight);
        }
        this.totalWeight = currentWeight;
    }
    static fromOld(warbs, constraints, label) {
        return convertFromNext(FrequencyArbitrary.from(warbs.map((w) => (Object.assign(Object.assign({}, w), { arbitrary: convertToNext(w.arbitrary) }))), constraints, label));
    }
    static from(warbs, constraints, label) {
        if (warbs.length === 0) {
            throw new Error(`${label} expects at least one weighted arbitrary`);
        }
        let totalWeight = 0;
        for (let idx = 0; idx !== warbs.length; ++idx) {
            const currentArbitrary = warbs[idx].arbitrary;
            if (currentArbitrary === undefined) {
                throw new Error(`${label} expects arbitraries to be specified`);
            }
            const currentWeight = warbs[idx].weight;
            totalWeight += currentWeight;
            if (!Number.isInteger(currentWeight)) {
                throw new Error(`${label} expects weights to be integer values`);
            }
            if (currentWeight < 0) {
                throw new Error(`${label} expects weights to be superior or equal to 0`);
            }
        }
        if (totalWeight <= 0) {
            throw new Error(`${label} expects the sum of weights to be strictly superior to 0`);
        }
        return new FrequencyArbitrary(warbs, constraints, getDepthContextFor(constraints.depthIdentifier));
    }
    generate(mrng, biasFactor) {
        if (this.mustGenerateFirst()) {
            return this.safeGenerateForIndex(mrng, 0, biasFactor);
        }
        const selected = mrng.nextInt(this.computeNegDepthBenefit(), this.totalWeight - 1);
        for (let idx = 0; idx !== this.cumulatedWeights.length; ++idx) {
            if (selected < this.cumulatedWeights[idx]) {
                return this.safeGenerateForIndex(mrng, idx, biasFactor);
            }
        }
        throw new Error(`Unable to generate from fc.frequency`);
    }
    canShrinkWithoutContext(value) {
        return this.canShrinkWithoutContextIndex(value) !== -1;
    }
    shrink(value, context) {
        if (context !== undefined) {
            const safeContext = context;
            const selectedIndex = safeContext.selectedIndex;
            const originalBias = safeContext.originalBias;
            const originalArbitrary = this.warbs[selectedIndex].arbitrary;
            const originalShrinks = originalArbitrary
                .shrink(value, safeContext.originalContext)
                .map((v) => this.mapIntoNextValue(selectedIndex, v, null, originalBias));
            if (safeContext.clonedMrngForFallbackFirst !== null) {
                if (safeContext.cachedGeneratedForFirst === undefined) {
                    safeContext.cachedGeneratedForFirst = this.safeGenerateForIndex(safeContext.clonedMrngForFallbackFirst, 0, originalBias);
                }
                const valueFromFirst = safeContext.cachedGeneratedForFirst;
                return Stream.of(valueFromFirst).join(originalShrinks);
            }
            return originalShrinks;
        }
        const potentialSelectedIndex = this.canShrinkWithoutContextIndex(value);
        if (potentialSelectedIndex === -1) {
            return Stream.nil();
        }
        return this.defaultShrinkForFirst(potentialSelectedIndex).join(this.warbs[potentialSelectedIndex].arbitrary
            .shrink(value, undefined)
            .map((v) => this.mapIntoNextValue(potentialSelectedIndex, v, null, undefined)));
    }
    defaultShrinkForFirst(selectedIndex) {
        ++this.context.depth;
        try {
            if (!this.mustFallbackToFirstInShrink(selectedIndex) || this.warbs[0].fallbackValue === undefined) {
                return Stream.nil();
            }
        }
        finally {
            --this.context.depth;
        }
        const rawShrinkValue = new NextValue(this.warbs[0].fallbackValue.default, undefined);
        return Stream.of(this.mapIntoNextValue(0, rawShrinkValue, null, undefined));
    }
    canShrinkWithoutContextIndex(value) {
        if (this.mustGenerateFirst()) {
            return this.warbs[0].arbitrary.canShrinkWithoutContext(value) ? 0 : -1;
        }
        try {
            ++this.context.depth;
            for (let idx = 0; idx !== this.warbs.length; ++idx) {
                const warb = this.warbs[idx];
                if (warb.weight !== 0 && warb.arbitrary.canShrinkWithoutContext(value)) {
                    return idx;
                }
            }
            return -1;
        }
        finally {
            --this.context.depth;
        }
    }
    mapIntoNextValue(idx, value, clonedMrngForFallbackFirst, biasFactor) {
        const context = {
            selectedIndex: idx,
            originalBias: biasFactor,
            originalContext: value.context,
            clonedMrngForFallbackFirst,
        };
        return new NextValue(value.value, context);
    }
    safeGenerateForIndex(mrng, idx, biasFactor) {
        ++this.context.depth;
        try {
            const value = this.warbs[idx].arbitrary.generate(mrng, biasFactor);
            const clonedMrngForFallbackFirst = this.mustFallbackToFirstInShrink(idx) ? mrng.clone() : null;
            return this.mapIntoNextValue(idx, value, clonedMrngForFallbackFirst, biasFactor);
        }
        finally {
            --this.context.depth;
        }
    }
    mustGenerateFirst() {
        return this.constraints.maxDepth !== undefined && this.constraints.maxDepth <= this.context.depth;
    }
    mustFallbackToFirstInShrink(idx) {
        return idx !== 0 && !!this.constraints.withCrossShrink && this.warbs[0].weight !== 0;
    }
    computeNegDepthBenefit() {
        const depthFactor = this.constraints.depthFactor;
        if (depthFactor === undefined || depthFactor <= 0) {
            return 0;
        }
        const depthBenefit = Math.floor(Math.pow(1 + depthFactor, this.context.depth)) - 1;
        return -Math.min(this.warbs[0].weight * depthBenefit, Number.MAX_SAFE_INTEGER) || 0;
    }
}

import { NextArbitrary } from '../../check/arbitrary/definition/NextArbitrary.js';
import { NextValue } from '../../check/arbitrary/definition/NextValue.js';
import { makeLazy } from '../../stream/LazyIterableIterator.js';
import { Stream } from '../../stream/Stream.js';
import { isSubarrayOf } from './helpers/IsSubarrayOf.js';
import { IntegerArbitrary } from './IntegerArbitrary.js';
export class SubarrayArbitrary extends NextArbitrary {
    constructor(originalArray, isOrdered, minLength, maxLength) {
        super();
        this.originalArray = originalArray;
        this.isOrdered = isOrdered;
        this.minLength = minLength;
        this.maxLength = maxLength;
        if (minLength < 0 || minLength > originalArray.length)
            throw new Error('fc.*{s|S}ubarrayOf expects the minimal length to be between 0 and the size of the original array');
        if (maxLength < 0 || maxLength > originalArray.length)
            throw new Error('fc.*{s|S}ubarrayOf expects the maximal length to be between 0 and the size of the original array');
        if (minLength > maxLength)
            throw new Error('fc.*{s|S}ubarrayOf expects the minimal length to be inferior or equal to the maximal length');
        this.lengthArb = new IntegerArbitrary(minLength, maxLength);
        this.biasedLengthArb =
            minLength !== maxLength
                ? new IntegerArbitrary(minLength, minLength + Math.floor(Math.log(maxLength - minLength) / Math.log(2)))
                : this.lengthArb;
    }
    generate(mrng, biasFactor) {
        const lengthArb = biasFactor !== undefined && mrng.nextInt(1, biasFactor) === 1 ? this.biasedLengthArb : this.lengthArb;
        const size = lengthArb.generate(mrng, undefined);
        const sizeValue = size.value;
        const remainingElements = this.originalArray.map((_v, idx) => idx);
        const ids = [];
        for (let index = 0; index !== sizeValue; ++index) {
            const selectedIdIndex = mrng.nextInt(0, remainingElements.length - 1);
            ids.push(remainingElements[selectedIdIndex]);
            remainingElements.splice(selectedIdIndex, 1);
        }
        if (this.isOrdered) {
            ids.sort((a, b) => a - b);
        }
        return new NextValue(ids.map((i) => this.originalArray[i]), size.context);
    }
    canShrinkWithoutContext(value) {
        if (!Array.isArray(value)) {
            return false;
        }
        if (!this.lengthArb.canShrinkWithoutContext(value.length)) {
            return false;
        }
        return isSubarrayOf(this.originalArray, value);
    }
    shrink(value, context) {
        if (value.length === 0) {
            return Stream.nil();
        }
        return this.lengthArb
            .shrink(value.length, context)
            .map((newSize) => {
            return new NextValue(value.slice(value.length - newSize.value), newSize.context);
        })
            .join(value.length > this.minLength
            ? makeLazy(() => this.shrink(value.slice(1), undefined)
                .filter((newValue) => this.minLength <= newValue.value.length + 1)
                .map((newValue) => new NextValue([value[0]].concat(newValue.value), undefined)))
            : Stream.nil());
    }
}

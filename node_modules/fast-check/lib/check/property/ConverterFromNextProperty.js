"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConverterFromNextProperty = void 0;
const Shrinkable_1 = require("../arbitrary/definition/Shrinkable");
const identifier = '__ConverterFromNextProperty__';
function fromNextValueToShrinkableFor(property) {
    return function fromNextValueToShrinkable(v) {
        const shrinker = () => property.shrink(v).map(fromNextValueToShrinkable);
        if (!v.hasToBeCloned) {
            return new Shrinkable_1.Shrinkable(v.value_, shrinker);
        }
        return new Shrinkable_1.Shrinkable(v.value_, shrinker, () => v.value);
    };
}
class ConverterFromNextProperty {
    constructor(property) {
        this.property = property;
        this[_a] = true;
        this.toShrinkable = fromNextValueToShrinkableFor(property);
    }
    static isConverterFromNext(property) {
        return identifier in property;
    }
    isAsync() {
        return this.property.isAsync();
    }
    generate(mrng, runId) {
        const value = this.property.generate(mrng, runId);
        return this.toShrinkable(value);
    }
    run(v) {
        return this.property.run(v);
    }
}
exports.ConverterFromNextProperty = ConverterFromNextProperty;
_a = identifier;

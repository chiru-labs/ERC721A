"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConverterToNextProperty = void 0;
const Stream_1 = require("../../stream/Stream");
const ConverterToNext_1 = require("../arbitrary/definition/ConverterToNext");
const identifier = '__ConverterToNextProperty__';
class ConverterToNextProperty {
    constructor(property) {
        this.property = property;
        this[_a] = true;
    }
    static isConverterToNext(property) {
        return identifier in property;
    }
    isAsync() {
        return this.property.isAsync();
    }
    generate(mrng, runId) {
        const shrinkable = this.property.generate(mrng, runId);
        return (0, ConverterToNext_1.fromShrinkableToNextValue)(shrinkable);
    }
    shrink(value) {
        if (this.isSafeContext(value.context)) {
            return value.context.shrink().map(ConverterToNext_1.fromShrinkableToNextValue);
        }
        return Stream_1.Stream.nil();
    }
    isSafeContext(context) {
        return (context != null && typeof context === 'object' && 'value' in context && 'shrink' in context);
    }
    run(v) {
        return this.property.run(v);
    }
}
exports.ConverterToNextProperty = ConverterToNextProperty;
_a = identifier;

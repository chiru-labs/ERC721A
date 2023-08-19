var _a;
import { Stream } from '../../stream/Stream.js';
import { fromShrinkableToNextValue } from '../arbitrary/definition/ConverterToNext.js';
const identifier = '__ConverterToNextProperty__';
export class ConverterToNextProperty {
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
        return fromShrinkableToNextValue(shrinkable);
    }
    shrink(value) {
        if (this.isSafeContext(value.context)) {
            return value.context.shrink().map(fromShrinkableToNextValue);
        }
        return Stream.nil();
    }
    isSafeContext(context) {
        return (context != null && typeof context === 'object' && 'value' in context && 'shrink' in context);
    }
    run(v) {
        return this.property.run(v);
    }
}
_a = identifier;

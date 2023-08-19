import { Stream } from '../../../stream/Stream.js';
import { cloneMethod, hasCloneMethod } from '../../symbols.js';
export class Shrinkable {
    constructor(value_, shrink = () => Stream.nil(), customGetValue = undefined) {
        this.value_ = value_;
        this.shrink = shrink;
        this.hasToBeCloned = customGetValue !== undefined || hasCloneMethod(value_);
        this.readOnce = false;
        if (this.hasToBeCloned) {
            Object.defineProperty(this, 'value', { get: customGetValue !== undefined ? customGetValue : this.getValue });
        }
        else {
            this.value = value_;
        }
    }
    getValue() {
        if (!this.readOnce) {
            this.readOnce = true;
            return this.value_;
        }
        return this.value_[cloneMethod]();
    }
    applyMapper(mapper) {
        if (this.hasToBeCloned) {
            const out = mapper(this.value);
            if (out instanceof Object) {
                out[cloneMethod] = () => this.applyMapper(mapper);
            }
            return out;
        }
        return mapper(this.value);
    }
    map(mapper) {
        return new Shrinkable(this.applyMapper(mapper), () => this.shrink().map((v) => v.map(mapper)));
    }
    filter(refinement) {
        const refinementOnShrinkable = (s) => {
            return refinement(s.value_);
        };
        return new Shrinkable(this.value, () => this.shrink()
            .filter(refinementOnShrinkable)
            .map((v) => v.filter(refinement)));
    }
}

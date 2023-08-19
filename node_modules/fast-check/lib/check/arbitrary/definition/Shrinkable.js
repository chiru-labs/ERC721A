"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shrinkable = void 0;
const Stream_1 = require("../../../stream/Stream");
const symbols_1 = require("../../symbols");
class Shrinkable {
    constructor(value_, shrink = () => Stream_1.Stream.nil(), customGetValue = undefined) {
        this.value_ = value_;
        this.shrink = shrink;
        this.hasToBeCloned = customGetValue !== undefined || (0, symbols_1.hasCloneMethod)(value_);
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
        return this.value_[symbols_1.cloneMethod]();
    }
    applyMapper(mapper) {
        if (this.hasToBeCloned) {
            const out = mapper(this.value);
            if (out instanceof Object) {
                out[symbols_1.cloneMethod] = () => this.applyMapper(mapper);
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
exports.Shrinkable = Shrinkable;

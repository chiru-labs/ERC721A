"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextValue = void 0;
const symbols_1 = require("../../symbols");
class NextValue {
    constructor(value_, context, customGetValue = undefined) {
        this.value_ = value_;
        this.context = context;
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
        if (this.hasToBeCloned) {
            if (!this.readOnce) {
                this.readOnce = true;
                return this.value_;
            }
            return this.value_[symbols_1.cloneMethod]();
        }
        return this.value_;
    }
}
exports.NextValue = NextValue;

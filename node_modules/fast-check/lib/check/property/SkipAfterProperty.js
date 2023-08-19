"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipAfterProperty = void 0;
const PreconditionFailure_1 = require("../precondition/PreconditionFailure");
class SkipAfterProperty {
    constructor(property, getTime, timeLimit, interruptExecution) {
        this.property = property;
        this.getTime = getTime;
        this.interruptExecution = interruptExecution;
        this.skipAfterTime = this.getTime() + timeLimit;
    }
    isAsync() {
        return this.property.isAsync();
    }
    generate(mrng, runId) {
        return this.property.generate(mrng, runId);
    }
    shrink(value) {
        return this.property.shrink(value);
    }
    run(v) {
        if (this.getTime() >= this.skipAfterTime) {
            const preconditionFailure = new PreconditionFailure_1.PreconditionFailure(this.interruptExecution);
            if (this.isAsync()) {
                return Promise.resolve(preconditionFailure);
            }
            else {
                return preconditionFailure;
            }
        }
        return this.property.run(v);
    }
}
exports.SkipAfterProperty = SkipAfterProperty;

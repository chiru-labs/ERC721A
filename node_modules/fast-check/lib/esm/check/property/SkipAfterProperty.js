import { PreconditionFailure } from '../precondition/PreconditionFailure.js';
export class SkipAfterProperty {
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
            const preconditionFailure = new PreconditionFailure(this.interruptExecution);
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

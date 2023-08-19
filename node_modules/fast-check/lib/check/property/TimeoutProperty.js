"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutProperty = void 0;
const timeoutAfter = (timeMs) => {
    let timeoutHandle = null;
    const promise = new Promise((resolve) => {
        timeoutHandle = setTimeout(() => {
            resolve(`Property timeout: exceeded limit of ${timeMs} milliseconds`);
        }, timeMs);
    });
    return {
        clear: () => clearTimeout(timeoutHandle),
        promise,
    };
};
class TimeoutProperty {
    constructor(property, timeMs) {
        this.property = property;
        this.timeMs = timeMs;
    }
    isAsync() {
        return true;
    }
    generate(mrng, runId) {
        return this.property.generate(mrng, runId);
    }
    shrink(value) {
        return this.property.shrink(value);
    }
    async run(v) {
        const t = timeoutAfter(this.timeMs);
        const propRun = Promise.race([this.property.run(v), t.promise]);
        propRun.then(t.clear, t.clear);
        return propRun;
    }
}
exports.TimeoutProperty = TimeoutProperty;

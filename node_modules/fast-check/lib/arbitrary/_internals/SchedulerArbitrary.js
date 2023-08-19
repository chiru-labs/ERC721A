"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerArbitrary = void 0;
const NextArbitrary_1 = require("../../check/arbitrary/definition/NextArbitrary");
const NextValue_1 = require("../../check/arbitrary/definition/NextValue");
const Stream_1 = require("../../stream/Stream");
const SchedulerImplem_1 = require("./implementations/SchedulerImplem");
function buildNextTaskIndex(mrng) {
    const clonedMrng = mrng.clone();
    return {
        clone: () => buildNextTaskIndex(clonedMrng),
        nextTaskIndex: (scheduledTasks) => {
            return mrng.nextInt(0, scheduledTasks.length - 1);
        },
    };
}
class SchedulerArbitrary extends NextArbitrary_1.NextArbitrary {
    constructor(act) {
        super();
        this.act = act;
    }
    generate(mrng, _biasFactor) {
        return new NextValue_1.NextValue(new SchedulerImplem_1.SchedulerImplem(this.act, buildNextTaskIndex(mrng.clone())), undefined);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(_value, _context) {
        return Stream_1.Stream.nil();
    }
}
exports.SchedulerArbitrary = SchedulerArbitrary;

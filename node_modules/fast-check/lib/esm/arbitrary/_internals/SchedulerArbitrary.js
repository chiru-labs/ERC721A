import { NextArbitrary } from '../../check/arbitrary/definition/NextArbitrary.js';
import { NextValue } from '../../check/arbitrary/definition/NextValue.js';
import { Stream } from '../../stream/Stream.js';
import { SchedulerImplem } from './implementations/SchedulerImplem.js';
function buildNextTaskIndex(mrng) {
    const clonedMrng = mrng.clone();
    return {
        clone: () => buildNextTaskIndex(clonedMrng),
        nextTaskIndex: (scheduledTasks) => {
            return mrng.nextInt(0, scheduledTasks.length - 1);
        },
    };
}
export class SchedulerArbitrary extends NextArbitrary {
    constructor(act) {
        super();
        this.act = act;
    }
    generate(mrng, _biasFactor) {
        return new NextValue(new SchedulerImplem(this.act, buildNextTaskIndex(mrng.clone())), undefined);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(_value, _context) {
        return Stream.nil();
    }
}

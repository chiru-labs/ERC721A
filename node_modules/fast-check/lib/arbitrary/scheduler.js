"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerFor = exports.scheduler = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const BuildSchedulerFor_1 = require("./_internals/helpers/BuildSchedulerFor");
const SchedulerArbitrary_1 = require("./_internals/SchedulerArbitrary");
function scheduler(constraints) {
    const { act = (f) => f() } = constraints || {};
    return (0, Converters_1.convertFromNext)(new SchedulerArbitrary_1.SchedulerArbitrary(act));
}
exports.scheduler = scheduler;
function schedulerFor(customOrderingOrConstraints, constraintsOrUndefined) {
    const { act = (f) => f() } = Array.isArray(customOrderingOrConstraints)
        ? constraintsOrUndefined || {}
        : customOrderingOrConstraints || {};
    if (Array.isArray(customOrderingOrConstraints)) {
        return (0, BuildSchedulerFor_1.buildSchedulerFor)(act, customOrderingOrConstraints);
    }
    return function (_strs, ...ordering) {
        return (0, BuildSchedulerFor_1.buildSchedulerFor)(act, ordering);
    };
}
exports.schedulerFor = schedulerFor;

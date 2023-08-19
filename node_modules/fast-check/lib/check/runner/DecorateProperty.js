"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateProperty = void 0;
const SkipAfterProperty_1 = require("../property/SkipAfterProperty");
const TimeoutProperty_1 = require("../property/TimeoutProperty");
const UnbiasedProperty_1 = require("../property/UnbiasedProperty");
const IgnoreEqualValuesProperty_1 = require("../property/IgnoreEqualValuesProperty");
const ConvertersProperty_1 = require("../property/ConvertersProperty");
function decorateProperty(rawProperty, qParams) {
    let prop = (0, ConvertersProperty_1.convertToNextProperty)(rawProperty);
    if (rawProperty.isAsync() && qParams.timeout != null) {
        prop = new TimeoutProperty_1.TimeoutProperty(prop, qParams.timeout);
    }
    if (qParams.unbiased) {
        prop = new UnbiasedProperty_1.UnbiasedProperty(prop);
    }
    if (qParams.skipAllAfterTimeLimit != null) {
        prop = new SkipAfterProperty_1.SkipAfterProperty(prop, Date.now, qParams.skipAllAfterTimeLimit, false);
    }
    if (qParams.interruptAfterTimeLimit != null) {
        prop = new SkipAfterProperty_1.SkipAfterProperty(prop, Date.now, qParams.interruptAfterTimeLimit, true);
    }
    if (qParams.skipEqualValues) {
        prop = new IgnoreEqualValuesProperty_1.IgnoreEqualValuesProperty(prop, true);
    }
    if (qParams.ignoreEqualValues) {
        prop = new IgnoreEqualValuesProperty_1.IgnoreEqualValuesProperty(prop, false);
    }
    return prop;
}
exports.decorateProperty = decorateProperty;

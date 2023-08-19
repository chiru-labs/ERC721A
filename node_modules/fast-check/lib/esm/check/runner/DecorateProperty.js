import { SkipAfterProperty } from '../property/SkipAfterProperty.js';
import { TimeoutProperty } from '../property/TimeoutProperty.js';
import { UnbiasedProperty } from '../property/UnbiasedProperty.js';
import { IgnoreEqualValuesProperty } from '../property/IgnoreEqualValuesProperty.js';
import { convertToNextProperty } from '../property/ConvertersProperty.js';
export function decorateProperty(rawProperty, qParams) {
    let prop = convertToNextProperty(rawProperty);
    if (rawProperty.isAsync() && qParams.timeout != null) {
        prop = new TimeoutProperty(prop, qParams.timeout);
    }
    if (qParams.unbiased) {
        prop = new UnbiasedProperty(prop);
    }
    if (qParams.skipAllAfterTimeLimit != null) {
        prop = new SkipAfterProperty(prop, Date.now, qParams.skipAllAfterTimeLimit, false);
    }
    if (qParams.interruptAfterTimeLimit != null) {
        prop = new SkipAfterProperty(prop, Date.now, qParams.interruptAfterTimeLimit, true);
    }
    if (qParams.skipEqualValues) {
        prop = new IgnoreEqualValuesProperty(prop, true);
    }
    if (qParams.ignoreEqualValues) {
        prop = new IgnoreEqualValuesProperty(prop, false);
    }
    return prop;
}

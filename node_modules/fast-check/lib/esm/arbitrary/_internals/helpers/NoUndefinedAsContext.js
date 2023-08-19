import { NextValue } from '../../../check/arbitrary/definition/NextValue.js';
export const UndefinedContextPlaceholder = Symbol('UndefinedContextPlaceholder');
export function noUndefinedAsContext(value) {
    if (value.context !== undefined) {
        return value;
    }
    if (value.hasToBeCloned) {
        return new NextValue(value.value_, UndefinedContextPlaceholder, () => value.value);
    }
    return new NextValue(value.value_, UndefinedContextPlaceholder);
}

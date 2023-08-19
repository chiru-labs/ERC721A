"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noUndefinedAsContext = exports.UndefinedContextPlaceholder = void 0;
const NextValue_1 = require("../../../check/arbitrary/definition/NextValue");
exports.UndefinedContextPlaceholder = Symbol('UndefinedContextPlaceholder');
function noUndefinedAsContext(value) {
    if (value.context !== undefined) {
        return value;
    }
    if (value.hasToBeCloned) {
        return new NextValue_1.NextValue(value.value_, exports.UndefinedContextPlaceholder, () => value.value);
    }
    return new NextValue_1.NextValue(value.value_, exports.UndefinedContextPlaceholder);
}
exports.noUndefinedAsContext = noUndefinedAsContext;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneIfNeeded = exports.hasCloneMethod = exports.cloneMethod = void 0;
exports.cloneMethod = Symbol('fast-check/cloneMethod');
function hasCloneMethod(instance) {
    return (instance !== null &&
        (typeof instance === 'object' || typeof instance === 'function') &&
        exports.cloneMethod in instance &&
        typeof instance[exports.cloneMethod] === 'function');
}
exports.hasCloneMethod = hasCloneMethod;
function cloneIfNeeded(instance) {
    return hasCloneMethod(instance) ? instance[exports.cloneMethod]() : instance;
}
exports.cloneIfNeeded = cloneIfNeeded;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepthContextFor = void 0;
const depthContextCache = new Map();
function getDepthContextFor(contextMeta) {
    if (contextMeta === undefined) {
        return { depth: 0 };
    }
    if (typeof contextMeta !== 'string') {
        return contextMeta;
    }
    const cachedContext = depthContextCache.get(contextMeta);
    if (cachedContext !== undefined) {
        return cachedContext;
    }
    const context = { depth: 0 };
    depthContextCache.set(contextMeta, context);
    return context;
}
exports.getDepthContextFor = getDepthContextFor;

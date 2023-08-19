"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignatureForFn = exports.getIndexedSignatureForEvent = exports.getFullSignatureForEvent = exports.getFullSignatureAsSymbolForEvent = void 0;
function getFullSignatureAsSymbolForEvent(event) {
    return `${event.name}_${event.inputs.map((e) => e.type.originalType).join('_')}`;
}
exports.getFullSignatureAsSymbolForEvent = getFullSignatureAsSymbolForEvent;
function getFullSignatureForEvent(event) {
    return `${event.name}(${event.inputs.map((e) => e.type.originalType).join(',')})`;
}
exports.getFullSignatureForEvent = getFullSignatureForEvent;
function getIndexedSignatureForEvent(event) {
    const indexedType = event.inputs.filter((e) => e.isIndexed);
    return `${event.name}(${indexedType.map((e) => e.type.originalType).join(',')})`;
}
exports.getIndexedSignatureForEvent = getIndexedSignatureForEvent;
function getSignatureForFn(fn) {
    return `${fn.name}(${fn.inputs.map((i) => i.type.originalType).join(',')})`;
}
exports.getSignatureForFn = getSignatureForFn;
//# sourceMappingURL=signatures.js.map
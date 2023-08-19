"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEntry = exports.normalize = void 0;
const normalize = (looseAbi) => looseAbi.map(exports.normalizeEntry);
exports.normalize = normalize;
const normalizeEntry = (looseEntry) => {
    if (looseEntry.type === "event" || looseEntry.type === "error") {
        // nothing gets normalized for events or errors right now
        return looseEntry;
    }
    const entry = Object.assign(Object.assign(Object.assign({}, looseEntry), normalizeStateMutability(looseEntry)), { type: looseEntry.type || "function" });
    if (entry.type === "function") {
        entry.outputs = entry.outputs || [];
    }
    delete entry.payable;
    delete entry.constant;
    return entry;
};
exports.normalizeEntry = normalizeEntry;
const normalizeStateMutability = ({ stateMutability, payable, constant }) => {
    if (stateMutability) {
        return { stateMutability };
    }
    return {
        stateMutability: payable ? "payable" : constant ? "view" : "nonpayable"
    };
};
//# sourceMappingURL=normalize.js.map
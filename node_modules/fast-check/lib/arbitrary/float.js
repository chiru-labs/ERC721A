"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.float = void 0;
const floatNext_1 = require("./_next/floatNext");
const integer_1 = require("./integer");
function next(n) {
    return (0, integer_1.integer)(0, (1 << n) - 1);
}
const floatInternal = () => {
    return next(24).map((v) => v / (1 << 24));
};
function float(...args) {
    if (typeof args[0] === 'object') {
        if (args[0].next) {
            return (0, floatNext_1.floatNext)(args[0]);
        }
        const min = args[0].min !== undefined ? args[0].min : 0;
        const max = args[0].max !== undefined ? args[0].max : 1;
        return (floatInternal()
            .map((v) => min + v * (max - min))
            .filter((g) => g !== max || g === min));
    }
    else {
        const a = args[0];
        const b = args[1];
        if (a === undefined)
            return floatInternal();
        if (b === undefined)
            return (floatInternal()
                .map((v) => v * a)
                .filter((g) => g !== a || g === 0));
        return (floatInternal()
            .map((v) => a + v * (b - a))
            .filter((g) => g !== b || g === a));
    }
}
exports.float = float;

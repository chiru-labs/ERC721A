"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.double = void 0;
const integer_1 = require("./integer");
const tuple_1 = require("./tuple");
const doubleNext_1 = require("./_next/doubleNext");
function next(n) {
    return (0, integer_1.integer)(0, (1 << n) - 1);
}
const doubleFactor = Math.pow(2, 27);
const doubleDivisor = Math.pow(2, -53);
const doubleInternal = () => {
    return (0, tuple_1.tuple)(next(26), next(27)).map((v) => (v[0] * doubleFactor + v[1]) * doubleDivisor);
};
function double(...args) {
    if (typeof args[0] === 'object') {
        if (args[0].next) {
            return (0, doubleNext_1.doubleNext)(args[0]);
        }
        const min = args[0].min !== undefined ? args[0].min : 0;
        const max = args[0].max !== undefined ? args[0].max : 1;
        return (doubleInternal()
            .map((v) => min + v * (max - min))
            .filter((g) => g !== max || g === min));
    }
    else {
        const a = args[0];
        const b = args[1];
        if (a === undefined)
            return doubleInternal();
        if (b === undefined)
            return (doubleInternal()
                .map((v) => v * a)
                .filter((g) => g !== a || g === 0));
        return (doubleInternal()
            .map((v) => a + v * (b - a))
            .filter((g) => g !== b || g === a));
    }
}
exports.double = double;

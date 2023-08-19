"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareFunc = void 0;
const CompareFunctionArbitraryBuilder_1 = require("./_internals/builders/CompareFunctionArbitraryBuilder");
function compareFunc() {
    return (0, CompareFunctionArbitraryBuilder_1.buildCompareFunctionArbitrary)(Object.assign((hA, hB) => hA - hB, {
        toString() {
            return '(hA, hB) => hA - hB';
        },
    }));
}
exports.compareFunc = compareFunc;

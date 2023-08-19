"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffledSubarray = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const SubarrayArbitrary_1 = require("./_internals/SubarrayArbitrary");
function shuffledSubarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return (0, Converters_1.convertFromNext)(new SubarrayArbitrary_1.SubarrayArbitrary(originalArray, false, args[0], args[1]));
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return (0, Converters_1.convertFromNext)(new SubarrayArbitrary_1.SubarrayArbitrary(originalArray, false, minLength, maxLength));
}
exports.shuffledSubarray = shuffledSubarray;

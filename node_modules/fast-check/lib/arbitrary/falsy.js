"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.falsy = void 0;
const constantFrom_1 = require("./constantFrom");
function falsy(constraints) {
    if (!constraints || !constraints.withBigInt) {
        return (0, constantFrom_1.constantFrom)(false, null, undefined, 0, '', NaN);
    }
    return (0, constantFrom_1.constantFrom)(false, null, undefined, 0, '', NaN, BigInt(0));
}
exports.falsy = falsy;

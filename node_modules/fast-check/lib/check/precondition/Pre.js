"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pre = void 0;
const PreconditionFailure_1 = require("./PreconditionFailure");
function pre(expectTruthy) {
    if (!expectTruthy) {
        throw new PreconditionFailure_1.PreconditionFailure();
    }
}
exports.pre = pre;

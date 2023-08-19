"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonConstraintsBuilder = void 0;
const boolean_1 = require("../../boolean");
const constant_1 = require("../../constant");
const double_1 = require("../../double");
function jsonConstraintsBuilder(stringArbitrary, constraints) {
    const { depthFactor = 0.1, maxDepth } = constraints;
    const key = stringArbitrary;
    const values = [
        (0, boolean_1.boolean)(),
        (0, double_1.double)({ next: true, noDefaultInfinity: true, noNaN: true }),
        stringArbitrary,
        (0, constant_1.constant)(null),
    ];
    return { key, values, depthFactor, maxDepth };
}
exports.jsonConstraintsBuilder = jsonConstraintsBuilder;

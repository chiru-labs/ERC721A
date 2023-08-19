"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = void 0;
const jsonValue_1 = require("./jsonValue");
function json(constraints) {
    const arb = constraints != null ? (0, jsonValue_1.jsonValue)(constraints) : (0, jsonValue_1.jsonValue)();
    return arb.map(JSON.stringify);
}
exports.json = json;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonObject = void 0;
const jsonValue_1 = require("./jsonValue");
function jsonObject(constraints) {
    return typeof constraints === 'number'
        ? (0, jsonValue_1.jsonValue)({ maxDepth: constraints, depthFactor: 0 })
        : (0, jsonValue_1.jsonValue)(Object.assign(Object.assign({}, constraints), { depthFactor: constraints !== undefined && constraints.depthFactor !== undefined ? constraints.depthFactor : 0 }));
}
exports.jsonObject = jsonObject;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unicodeJsonObject = void 0;
const unicodeJsonValue_1 = require("./unicodeJsonValue");
function unicodeJsonObject(constraints) {
    return typeof constraints === 'number'
        ? (0, unicodeJsonValue_1.unicodeJsonValue)({ maxDepth: constraints, depthFactor: 0 })
        : (0, unicodeJsonValue_1.unicodeJsonValue)(Object.assign(Object.assign({}, constraints), { depthFactor: constraints !== undefined && constraints.depthFactor !== undefined ? constraints.depthFactor : 0 }));
}
exports.unicodeJsonObject = unicodeJsonObject;

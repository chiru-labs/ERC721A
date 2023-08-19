"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unicodeJson = void 0;
const unicodeJsonValue_1 = require("./unicodeJsonValue");
function unicodeJson(constraints) {
    const arb = constraints != null ? (0, unicodeJsonValue_1.unicodeJsonValue)(constraints) : (0, unicodeJsonValue_1.unicodeJsonValue)();
    return arb.map(JSON.stringify);
}
exports.unicodeJson = unicodeJson;

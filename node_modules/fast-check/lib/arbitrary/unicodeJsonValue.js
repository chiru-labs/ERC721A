"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unicodeJsonValue = void 0;
const unicodeString_1 = require("./unicodeString");
const JsonConstraintsBuilder_1 = require("./_internals/helpers/JsonConstraintsBuilder");
const anything_1 = require("./anything");
function unicodeJsonValue(constraints = {}) {
    return (0, anything_1.anything)((0, JsonConstraintsBuilder_1.jsonConstraintsBuilder)((0, unicodeString_1.unicodeString)(), constraints));
}
exports.unicodeJsonValue = unicodeJsonValue;

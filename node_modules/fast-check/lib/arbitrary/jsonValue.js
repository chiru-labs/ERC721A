"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonValue = void 0;
const string_1 = require("./string");
const JsonConstraintsBuilder_1 = require("./_internals/helpers/JsonConstraintsBuilder");
const anything_1 = require("./anything");
function jsonValue(constraints = {}) {
    return (0, anything_1.anything)((0, JsonConstraintsBuilder_1.jsonConstraintsBuilder)((0, string_1.string)(), constraints));
}
exports.jsonValue = jsonValue;

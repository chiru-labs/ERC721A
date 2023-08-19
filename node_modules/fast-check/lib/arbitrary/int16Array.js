"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.int16Array = void 0;
const integer_1 = require("./integer");
const TypedIntArrayArbitraryBuilder_1 = require("./_internals/builders/TypedIntArrayArbitraryBuilder");
function int16Array(constraints = {}) {
    return (0, TypedIntArrayArbitraryBuilder_1.typedIntArrayArbitraryArbitraryBuilder)(constraints, -32768, 32767, Int16Array, integer_1.integer);
}
exports.int16Array = int16Array;

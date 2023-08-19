"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.int32Array = void 0;
const integer_1 = require("./integer");
const TypedIntArrayArbitraryBuilder_1 = require("./_internals/builders/TypedIntArrayArbitraryBuilder");
function int32Array(constraints = {}) {
    return (0, TypedIntArrayArbitraryBuilder_1.typedIntArrayArbitraryArbitraryBuilder)(constraints, -0x80000000, 0x7fffffff, Int32Array, integer_1.integer);
}
exports.int32Array = int32Array;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint32Array = void 0;
const integer_1 = require("./integer");
const TypedIntArrayArbitraryBuilder_1 = require("./_internals/builders/TypedIntArrayArbitraryBuilder");
function uint32Array(constraints = {}) {
    return (0, TypedIntArrayArbitraryBuilder_1.typedIntArrayArbitraryArbitraryBuilder)(constraints, 0, 0xffffffff, Uint32Array, integer_1.integer);
}
exports.uint32Array = uint32Array;

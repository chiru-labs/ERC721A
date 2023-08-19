"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint16Array = void 0;
const integer_1 = require("./integer");
const TypedIntArrayArbitraryBuilder_1 = require("./_internals/builders/TypedIntArrayArbitraryBuilder");
function uint16Array(constraints = {}) {
    return (0, TypedIntArrayArbitraryBuilder_1.typedIntArrayArbitraryArbitraryBuilder)(constraints, 0, 65535, Uint16Array, integer_1.integer);
}
exports.uint16Array = uint16Array;

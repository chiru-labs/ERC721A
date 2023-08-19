"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8Array = void 0;
const integer_1 = require("./integer");
const TypedIntArrayArbitraryBuilder_1 = require("./_internals/builders/TypedIntArrayArbitraryBuilder");
function uint8Array(constraints = {}) {
    return (0, TypedIntArrayArbitraryBuilder_1.typedIntArrayArbitraryArbitraryBuilder)(constraints, 0, 255, Uint8Array, integer_1.integer);
}
exports.uint8Array = uint8Array;

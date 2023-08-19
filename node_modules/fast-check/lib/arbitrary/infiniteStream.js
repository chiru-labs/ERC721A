"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infiniteStream = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const StreamArbitrary_1 = require("./_internals/StreamArbitrary");
function infiniteStream(arb) {
    return (0, Converters_1.convertFromNext)(new StreamArbitrary_1.StreamArbitrary((0, Converters_1.convertToNext)(arb)));
}
exports.infiniteStream = infiniteStream;

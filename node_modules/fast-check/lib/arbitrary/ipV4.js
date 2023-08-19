"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipV4 = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const nat_1 = require("./nat");
const tuple_1 = require("./tuple");
const NatToStringifiedNat_1 = require("./_internals/mappers/NatToStringifiedNat");
function dotJoinerMapper(data) {
    return data.join('.');
}
function dotJoinerUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    return value.split('.').map((v) => (0, NatToStringifiedNat_1.tryParseStringifiedNat)(v, 10));
}
function ipV4() {
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, tuple_1.tuple)((0, nat_1.nat)(255), (0, nat_1.nat)(255), (0, nat_1.nat)(255), (0, nat_1.nat)(255))).map(dotJoinerMapper, dotJoinerUnmapper));
}
exports.ipV4 = ipV4;

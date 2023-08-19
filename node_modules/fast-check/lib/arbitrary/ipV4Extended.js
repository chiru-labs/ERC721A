"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipV4Extended = void 0;
const oneof_1 = require("./oneof");
const tuple_1 = require("./tuple");
const StringifiedNatArbitraryBuilder_1 = require("./_internals/builders/StringifiedNatArbitraryBuilder");
const Converters_1 = require("../check/arbitrary/definition/Converters");
function dotJoinerMapper(data) {
    return data.join('.');
}
function dotJoinerUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    return value.split('.');
}
function ipV4Extended() {
    return (0, oneof_1.oneof)((0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, tuple_1.tuple)((0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(255), (0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(255), (0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(255), (0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(255))).map(dotJoinerMapper, dotJoinerUnmapper)), (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, tuple_1.tuple)((0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(255), (0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(255), (0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(65535))).map(dotJoinerMapper, dotJoinerUnmapper)), (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, tuple_1.tuple)((0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(255), (0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(16777215))).map(dotJoinerMapper, dotJoinerUnmapper)), (0, StringifiedNatArbitraryBuilder_1.buildStringifiedNatArbitrary)(4294967295));
}
exports.ipV4Extended = ipV4Extended;

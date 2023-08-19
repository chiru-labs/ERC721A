"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = void 0;
const Converters_1 = require("../check/arbitrary/definition/Converters");
const tuple_1 = require("./tuple");
const PaddedNumberArbitraryBuilder_1 = require("./_internals/builders/PaddedNumberArbitraryBuilder");
const PaddedEightsToUuid_1 = require("./_internals/mappers/PaddedEightsToUuid");
function uuid() {
    const padded = (0, PaddedNumberArbitraryBuilder_1.buildPaddedNumberArbitrary)(0, 0xffffffff);
    const secondPadded = (0, PaddedNumberArbitraryBuilder_1.buildPaddedNumberArbitrary)(0x10000000, 0x5fffffff);
    const thirdPadded = (0, PaddedNumberArbitraryBuilder_1.buildPaddedNumberArbitrary)(0x80000000, 0xbfffffff);
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, tuple_1.tuple)(padded, secondPadded, thirdPadded, padded)).map(PaddedEightsToUuid_1.paddedEightsToUuidMapper, PaddedEightsToUuid_1.paddedEightsToUuidUnmapper));
}
exports.uuid = uuid;

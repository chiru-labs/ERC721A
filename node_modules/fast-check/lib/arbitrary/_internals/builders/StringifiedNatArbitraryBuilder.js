"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStringifiedNatArbitrary = void 0;
const Converters_1 = require("../../../check/arbitrary/definition/Converters");
const constantFrom_1 = require("../../constantFrom");
const nat_1 = require("../../nat");
const tuple_1 = require("../../tuple");
const NatToStringifiedNat_1 = require("../mappers/NatToStringifiedNat");
function buildStringifiedNatArbitrary(maxValue) {
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, tuple_1.tuple)((0, constantFrom_1.constantFrom)('dec', 'oct', 'hex'), (0, nat_1.nat)(maxValue))).map(NatToStringifiedNat_1.natToStringifiedNatMapper, NatToStringifiedNat_1.natToStringifiedNatUnmapper));
}
exports.buildStringifiedNatArbitrary = buildStringifiedNatArbitrary;

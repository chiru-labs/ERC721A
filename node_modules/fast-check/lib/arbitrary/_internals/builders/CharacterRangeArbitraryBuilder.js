"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAlphaNumericPercentArbitrary = exports.buildAlphaNumericArbitrary = exports.buildLowerAlphaNumericArbitrary = exports.buildLowerAlphaArbitrary = void 0;
const fullUnicode_1 = require("../../fullUnicode");
const frequency_1 = require("../../frequency");
const mapToConstant_1 = require("../../mapToConstant");
const Converters_1 = require("../../../check/arbitrary/definition/Converters");
const lowerCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x61) };
const upperCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x41) };
const numericMapper = { num: 10, build: (v) => String.fromCharCode(v + 0x30) };
function percentCharArbMapper(c) {
    const encoded = encodeURIComponent(c);
    return c !== encoded ? encoded : `%${c.charCodeAt(0).toString(16)}`;
}
function percentCharArbUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported');
    }
    const decoded = decodeURIComponent(value);
    return decoded;
}
const percentCharArb = (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, fullUnicode_1.fullUnicode)()).map(percentCharArbMapper, percentCharArbUnmapper));
const buildLowerAlphaArbitrary = (others) => (0, mapToConstant_1.mapToConstant)(lowerCaseMapper, { num: others.length, build: (v) => others[v] });
exports.buildLowerAlphaArbitrary = buildLowerAlphaArbitrary;
const buildLowerAlphaNumericArbitrary = (others) => (0, mapToConstant_1.mapToConstant)(lowerCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
exports.buildLowerAlphaNumericArbitrary = buildLowerAlphaNumericArbitrary;
const buildAlphaNumericArbitrary = (others) => (0, mapToConstant_1.mapToConstant)(lowerCaseMapper, upperCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
exports.buildAlphaNumericArbitrary = buildAlphaNumericArbitrary;
const buildAlphaNumericPercentArbitrary = (others) => (0, frequency_1.frequency)({ weight: 10, arbitrary: (0, exports.buildAlphaNumericArbitrary)(others) }, { weight: 1, arbitrary: percentCharArb });
exports.buildAlphaNumericPercentArbitrary = buildAlphaNumericPercentArbitrary;

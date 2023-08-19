"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statistics = exports.sample = void 0;
const Stream_1 = require("../../stream/Stream");
const ConvertersProperty_1 = require("../property/ConvertersProperty");
const Property_generic_1 = require("../property/Property.generic");
const UnbiasedProperty_1 = require("../property/UnbiasedProperty");
const GlobalParameters_1 = require("./configuration/GlobalParameters");
const QualifiedParameters_1 = require("./configuration/QualifiedParameters");
const Tosser_1 = require("./Tosser");
const PathWalker_1 = require("./utils/PathWalker");
function toProperty(generator, qParams) {
    const prop = !Object.prototype.hasOwnProperty.call(generator, 'isAsync')
        ? new Property_generic_1.Property(generator, () => true)
        : (0, ConvertersProperty_1.convertToNextProperty)(generator);
    return qParams.unbiased === true ? new UnbiasedProperty_1.UnbiasedProperty(prop) : prop;
}
function streamSample(generator, params) {
    const extendedParams = typeof params === 'number'
        ? Object.assign(Object.assign({}, (0, GlobalParameters_1.readConfigureGlobal)()), { numRuns: params }) : Object.assign(Object.assign({}, (0, GlobalParameters_1.readConfigureGlobal)()), params);
    const qParams = QualifiedParameters_1.QualifiedParameters.read(extendedParams);
    const nextProperty = toProperty(generator, qParams);
    const shrink = nextProperty.shrink.bind(nextProperty);
    const tossedValues = (0, Stream_1.stream)((0, Tosser_1.toss)(nextProperty, qParams.seed, qParams.randomType, qParams.examples));
    if (qParams.path.length === 0) {
        return tossedValues.take(qParams.numRuns).map((s) => s().value_);
    }
    return (0, Stream_1.stream)((0, PathWalker_1.pathWalk)(qParams.path, tossedValues.map((s) => s()), shrink))
        .take(qParams.numRuns)
        .map((s) => s.value_);
}
function sample(generator, params) {
    return [...streamSample(generator, params)];
}
exports.sample = sample;
function statistics(generator, classify, params) {
    const extendedParams = typeof params === 'number'
        ? Object.assign(Object.assign({}, (0, GlobalParameters_1.readConfigureGlobal)()), { numRuns: params }) : Object.assign(Object.assign({}, (0, GlobalParameters_1.readConfigureGlobal)()), params);
    const qParams = QualifiedParameters_1.QualifiedParameters.read(extendedParams);
    const recorded = {};
    for (const g of streamSample(generator, params)) {
        const out = classify(g);
        const categories = Array.isArray(out) ? out : [out];
        for (const c of categories) {
            recorded[c] = (recorded[c] || 0) + 1;
        }
    }
    const data = Object.entries(recorded)
        .sort((a, b) => b[1] - a[1])
        .map((i) => [i[0], `${((i[1] * 100.0) / qParams.numRuns).toFixed(2)}%`]);
    const longestName = data.map((i) => i[0].length).reduce((p, c) => Math.max(p, c), 0);
    const longestPercent = data.map((i) => i[1].length).reduce((p, c) => Math.max(p, c), 0);
    for (const item of data) {
        qParams.logger(`${item[0].padEnd(longestName, '.')}..${item[1].padStart(longestPercent, '.')}`);
    }
}
exports.statistics = statistics;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPartialRecordArbitrary = void 0;
const Converters_1 = require("../../../check/arbitrary/definition/Converters");
const option_1 = require("../../option");
const tuple_1 = require("../../tuple");
const EnumerableKeysExtractor_1 = require("../helpers/EnumerableKeysExtractor");
const ValuesAndSeparateKeysToObject_1 = require("../mappers/ValuesAndSeparateKeysToObject");
const noKeyValue = Symbol('no-key');
function buildPartialRecordArbitrary(recordModel, requiredKeys) {
    const keys = (0, EnumerableKeysExtractor_1.extractEnumerableKeys)(recordModel);
    const arbs = [];
    for (let index = 0; index !== keys.length; ++index) {
        const k = keys[index];
        const requiredArbitrary = recordModel[k];
        if (requiredKeys === undefined || requiredKeys.indexOf(k) !== -1)
            arbs.push(requiredArbitrary);
        else
            arbs.push((0, option_1.option)(requiredArbitrary, { nil: noKeyValue }));
    }
    return (0, Converters_1.convertFromNext)((0, Converters_1.convertToNext)((0, tuple_1.tuple)(...arbs)).map((0, ValuesAndSeparateKeysToObject_1.buildValuesAndSeparateKeysToObjectMapper)(keys, noKeyValue), (0, ValuesAndSeparateKeysToObject_1.buildValuesAndSeparateKeysToObjectUnmapper)(keys, noKeyValue)));
}
exports.buildPartialRecordArbitrary = buildPartialRecordArbitrary;

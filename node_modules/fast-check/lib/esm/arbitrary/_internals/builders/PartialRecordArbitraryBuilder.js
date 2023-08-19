import { convertFromNext, convertToNext } from '../../../check/arbitrary/definition/Converters.js';
import { option } from '../../option.js';
import { tuple } from '../../tuple.js';
import { extractEnumerableKeys } from '../helpers/EnumerableKeysExtractor.js';
import { buildValuesAndSeparateKeysToObjectMapper, buildValuesAndSeparateKeysToObjectUnmapper, } from '../mappers/ValuesAndSeparateKeysToObject.js';
const noKeyValue = Symbol('no-key');
export function buildPartialRecordArbitrary(recordModel, requiredKeys) {
    const keys = extractEnumerableKeys(recordModel);
    const arbs = [];
    for (let index = 0; index !== keys.length; ++index) {
        const k = keys[index];
        const requiredArbitrary = recordModel[k];
        if (requiredKeys === undefined || requiredKeys.indexOf(k) !== -1)
            arbs.push(requiredArbitrary);
        else
            arbs.push(option(requiredArbitrary, { nil: noKeyValue }));
    }
    return convertFromNext(convertToNext(tuple(...arbs)).map(buildValuesAndSeparateKeysToObjectMapper(keys, noKeyValue), buildValuesAndSeparateKeysToObjectUnmapper(keys, noKeyValue)));
}

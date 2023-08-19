import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { array } from './array.js';
import { fullUnicode } from './fullUnicode.js';
import { extractStringConstraints, } from './_internals/helpers/StringConstraintsExtractor.js';
import { codePointsToStringMapper, codePointsToStringUnmapper } from './_internals/mappers/CodePointsToString.js';
function fullUnicodeString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(fullUnicode(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}
export { fullUnicodeString };

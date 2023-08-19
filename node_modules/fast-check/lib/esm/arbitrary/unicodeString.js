import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { array } from './array.js';
import { unicode } from './unicode.js';
import { extractStringConstraints, } from './_internals/helpers/StringConstraintsExtractor.js';
import { codePointsToStringMapper, codePointsToStringUnmapper } from './_internals/mappers/CodePointsToString.js';
function unicodeString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(unicode(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}
export { unicodeString };

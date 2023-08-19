import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { array } from './array.js';
import { char } from './char.js';
import { extractStringConstraints, } from './_internals/helpers/StringConstraintsExtractor.js';
import { codePointsToStringMapper, codePointsToStringUnmapper } from './_internals/mappers/CodePointsToString.js';
function string(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(char(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}
export { string };

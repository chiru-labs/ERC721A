import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { array } from './array.js';
import { ascii } from './ascii.js';
import { extractStringConstraints, } from './_internals/helpers/StringConstraintsExtractor.js';
import { codePointsToStringMapper, codePointsToStringUnmapper } from './_internals/mappers/CodePointsToString.js';
function asciiString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(ascii(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}
export { asciiString };

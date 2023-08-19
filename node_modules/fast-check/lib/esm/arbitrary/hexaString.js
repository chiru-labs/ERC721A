import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { array } from './array.js';
import { hexa } from './hexa.js';
import { extractStringConstraints, } from './_internals/helpers/StringConstraintsExtractor.js';
import { codePointsToStringMapper, codePointsToStringUnmapper } from './_internals/mappers/CodePointsToString.js';
function hexaString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(hexa(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}
export { hexaString };

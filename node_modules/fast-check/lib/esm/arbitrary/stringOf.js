import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { array } from './array.js';
import { extractStringConstraints, } from './_internals/helpers/StringConstraintsExtractor.js';
import { patternsToStringMapper, patternsToStringUnmapperFor } from './_internals/mappers/PatternsToString.js';
function stringOf(charArb, ...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(charArb, constraints)).map(patternsToStringMapper, patternsToStringUnmapperFor(convertToNext(charArb), constraints)));
}
export { stringOf };

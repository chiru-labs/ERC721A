import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { array } from './array.js';
import { char16bits } from './char16bits.js';
import { extractStringConstraints, } from './_internals/helpers/StringConstraintsExtractor.js';
import { charsToStringMapper, charsToStringUnmapper } from './_internals/mappers/CharsToString.js';
function string16bits(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(char16bits(), constraints)).map(charsToStringMapper, charsToStringUnmapper));
}
export { string16bits };

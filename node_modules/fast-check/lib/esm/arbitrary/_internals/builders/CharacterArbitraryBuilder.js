import { convertFromNext, convertToNext } from '../../../check/arbitrary/definition/Converters.js';
import { integer } from '../../integer.js';
import { indexToCharStringMapper, indexToCharStringUnmapper } from '../mappers/IndexToCharString.js';
export function buildCharacterArbitrary(min, max, mapToCode, unmapFromCode) {
    return convertFromNext(convertToNext(integer(min, max)).map((n) => indexToCharStringMapper(mapToCode(n)), (c) => unmapFromCode(indexToCharStringUnmapper(c))));
}

import { convertFromNext, convertToNext } from '../../../check/arbitrary/definition/Converters.js';
import { integer } from '../../integer.js';
import { numberToPaddedEightMapper, numberToPaddedEightUnmapper } from '../mappers/NumberToPaddedEight.js';
export function buildPaddedNumberArbitrary(min, max) {
    return convertFromNext(convertToNext(integer({ min, max })).map(numberToPaddedEightMapper, numberToPaddedEightUnmapper));
}

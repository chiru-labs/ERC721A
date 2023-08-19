import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { integer } from './integer.js';
import { timeToDateMapper, timeToDateUnmapper } from './_internals/mappers/TimeToDate.js';
export function date(constraints) {
    const intMin = constraints && constraints.min !== undefined ? constraints.min.getTime() : -8640000000000000;
    const intMax = constraints && constraints.max !== undefined ? constraints.max.getTime() : 8640000000000000;
    if (Number.isNaN(intMin))
        throw new Error('fc.date min must be valid instance of Date');
    if (Number.isNaN(intMax))
        throw new Error('fc.date max must be valid instance of Date');
    if (intMin > intMax)
        throw new Error('fc.date max must be greater or equal to min');
    return convertFromNext(convertToNext(integer(intMin, intMax)).map(timeToDateMapper, timeToDateUnmapper));
}

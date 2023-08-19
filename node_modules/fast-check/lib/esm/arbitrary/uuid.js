import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { tuple } from './tuple.js';
import { buildPaddedNumberArbitrary } from './_internals/builders/PaddedNumberArbitraryBuilder.js';
import { paddedEightsToUuidMapper, paddedEightsToUuidUnmapper } from './_internals/mappers/PaddedEightsToUuid.js';
export function uuid() {
    const padded = buildPaddedNumberArbitrary(0, 0xffffffff);
    const secondPadded = buildPaddedNumberArbitrary(0x10000000, 0x5fffffff);
    const thirdPadded = buildPaddedNumberArbitrary(0x80000000, 0xbfffffff);
    return convertFromNext(convertToNext(tuple(padded, secondPadded, thirdPadded, padded)).map(paddedEightsToUuidMapper, paddedEightsToUuidUnmapper));
}

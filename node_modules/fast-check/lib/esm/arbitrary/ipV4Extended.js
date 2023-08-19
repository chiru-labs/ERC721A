import { oneof } from './oneof.js';
import { tuple } from './tuple.js';
import { buildStringifiedNatArbitrary } from './_internals/builders/StringifiedNatArbitraryBuilder.js';
import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
function dotJoinerMapper(data) {
    return data.join('.');
}
function dotJoinerUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    return value.split('.');
}
export function ipV4Extended() {
    return oneof(convertFromNext(convertToNext(tuple(buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255))).map(dotJoinerMapper, dotJoinerUnmapper)), convertFromNext(convertToNext(tuple(buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(65535))).map(dotJoinerMapper, dotJoinerUnmapper)), convertFromNext(convertToNext(tuple(buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(16777215))).map(dotJoinerMapper, dotJoinerUnmapper)), buildStringifiedNatArbitrary(4294967295));
}

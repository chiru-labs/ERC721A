import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
import { nat } from './nat.js';
import { tuple } from './tuple.js';
import { tryParseStringifiedNat } from './_internals/mappers/NatToStringifiedNat.js';
function dotJoinerMapper(data) {
    return data.join('.');
}
function dotJoinerUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    return value.split('.').map((v) => tryParseStringifiedNat(v, 10));
}
export function ipV4() {
    return convertFromNext(convertToNext(tuple(nat(255), nat(255), nat(255), nat(255))).map(dotJoinerMapper, dotJoinerUnmapper));
}

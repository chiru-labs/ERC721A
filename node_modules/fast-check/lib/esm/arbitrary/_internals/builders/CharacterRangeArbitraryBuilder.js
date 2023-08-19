import { fullUnicode } from '../../fullUnicode.js';
import { frequency } from '../../frequency.js';
import { mapToConstant } from '../../mapToConstant.js';
import { convertFromNext, convertToNext } from '../../../check/arbitrary/definition/Converters.js';
const lowerCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x61) };
const upperCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x41) };
const numericMapper = { num: 10, build: (v) => String.fromCharCode(v + 0x30) };
function percentCharArbMapper(c) {
    const encoded = encodeURIComponent(c);
    return c !== encoded ? encoded : `%${c.charCodeAt(0).toString(16)}`;
}
function percentCharArbUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported');
    }
    const decoded = decodeURIComponent(value);
    return decoded;
}
const percentCharArb = convertFromNext(convertToNext(fullUnicode()).map(percentCharArbMapper, percentCharArbUnmapper));
export const buildLowerAlphaArbitrary = (others) => mapToConstant(lowerCaseMapper, { num: others.length, build: (v) => others[v] });
export const buildLowerAlphaNumericArbitrary = (others) => mapToConstant(lowerCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
export const buildAlphaNumericArbitrary = (others) => mapToConstant(lowerCaseMapper, upperCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
export const buildAlphaNumericPercentArbitrary = (others) => frequency({ weight: 10, arbitrary: buildAlphaNumericArbitrary(others) }, { weight: 1, arbitrary: percentCharArb });

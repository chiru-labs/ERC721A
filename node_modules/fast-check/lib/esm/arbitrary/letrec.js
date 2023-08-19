import { LazyArbitrary } from './_internals/LazyArbitrary.js';
import { convertFromNext, convertToNext } from '../check/arbitrary/definition/Converters.js';
export function letrec(builder) {
    const lazyArbs = Object.create(null);
    const tie = (key) => {
        if (!Object.prototype.hasOwnProperty.call(lazyArbs, key)) {
            lazyArbs[key] = new LazyArbitrary(String(key));
        }
        return convertFromNext(lazyArbs[key]);
    };
    const strictArbs = builder(tie);
    for (const key in strictArbs) {
        if (!Object.prototype.hasOwnProperty.call(strictArbs, key)) {
            continue;
        }
        const lazyAtKey = lazyArbs[key];
        const lazyArb = lazyAtKey !== undefined ? lazyAtKey : new LazyArbitrary(key);
        lazyArb.underlying = convertToNext(strictArbs[key]);
        lazyArbs[key] = lazyArb;
    }
    return strictArbs;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.letrec = void 0;
const LazyArbitrary_1 = require("./_internals/LazyArbitrary");
const Converters_1 = require("../check/arbitrary/definition/Converters");
function letrec(builder) {
    const lazyArbs = Object.create(null);
    const tie = (key) => {
        if (!Object.prototype.hasOwnProperty.call(lazyArbs, key)) {
            lazyArbs[key] = new LazyArbitrary_1.LazyArbitrary(String(key));
        }
        return (0, Converters_1.convertFromNext)(lazyArbs[key]);
    };
    const strictArbs = builder(tie);
    for (const key in strictArbs) {
        if (!Object.prototype.hasOwnProperty.call(strictArbs, key)) {
            continue;
        }
        const lazyAtKey = lazyArbs[key];
        const lazyArb = lazyAtKey !== undefined ? lazyAtKey : new LazyArbitrary_1.LazyArbitrary(key);
        lazyArb.underlying = (0, Converters_1.convertToNext)(strictArbs[key]);
        lazyArbs[key] = lazyArb;
    }
    return strictArbs;
}
exports.letrec = letrec;

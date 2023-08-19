"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneof = void 0;
const FrequencyArbitrary_1 = require("./_internals/FrequencyArbitrary");
function isOneOfContraints(param) {
    return param != null && typeof param === 'object' && !('generate' in param);
}
function oneof(...args) {
    const constraints = args[0];
    if (isOneOfContraints(constraints)) {
        const weightedArbs = args.slice(1).map((arbitrary) => ({ arbitrary, weight: 1 }));
        return FrequencyArbitrary_1.FrequencyArbitrary.fromOld(weightedArbs, constraints, 'fc.oneof');
    }
    const weightedArbs = args.map((arbitrary) => ({ arbitrary, weight: 1 }));
    return FrequencyArbitrary_1.FrequencyArbitrary.fromOld(weightedArbs, {}, 'fc.oneof');
}
exports.oneof = oneof;

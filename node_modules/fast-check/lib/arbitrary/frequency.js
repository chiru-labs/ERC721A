"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frequency = void 0;
const FrequencyArbitrary_1 = require("./_internals/FrequencyArbitrary");
function isFrequencyContraints(param) {
    return param != null && typeof param === 'object' && !('arbitrary' in param);
}
function frequency(...args) {
    const label = 'fc.frequency';
    const constraints = args[0];
    if (isFrequencyContraints(constraints)) {
        return FrequencyArbitrary_1.FrequencyArbitrary.fromOld(args.slice(1), constraints, label);
    }
    return FrequencyArbitrary_1.FrequencyArbitrary.fromOld(args, {}, label);
}
exports.frequency = frequency;

import { FrequencyArbitrary } from './_internals/FrequencyArbitrary.js';
function isFrequencyContraints(param) {
    return param != null && typeof param === 'object' && !('arbitrary' in param);
}
function frequency(...args) {
    const label = 'fc.frequency';
    const constraints = args[0];
    if (isFrequencyContraints(constraints)) {
        return FrequencyArbitrary.fromOld(args.slice(1), constraints, label);
    }
    return FrequencyArbitrary.fromOld(args, {}, label);
}
export { frequency };

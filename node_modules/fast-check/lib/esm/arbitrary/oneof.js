import { FrequencyArbitrary } from './_internals/FrequencyArbitrary.js';
function isOneOfContraints(param) {
    return param != null && typeof param === 'object' && !('generate' in param);
}
function oneof(...args) {
    const constraints = args[0];
    if (isOneOfContraints(constraints)) {
        const weightedArbs = args.slice(1).map((arbitrary) => ({ arbitrary, weight: 1 }));
        return FrequencyArbitrary.fromOld(weightedArbs, constraints, 'fc.oneof');
    }
    const weightedArbs = args.map((arbitrary) => ({ arbitrary, weight: 1 }));
    return FrequencyArbitrary.fromOld(weightedArbs, {}, 'fc.oneof');
}
export { oneof };

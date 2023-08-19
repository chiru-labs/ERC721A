import { buildCompareFunctionArbitrary } from './_internals/builders/CompareFunctionArbitraryBuilder.js';
export function compareBooleanFunc() {
    return buildCompareFunctionArbitrary(Object.assign((hA, hB) => hA < hB, {
        toString() {
            return '(hA, hB) => hA < hB';
        },
    }));
}

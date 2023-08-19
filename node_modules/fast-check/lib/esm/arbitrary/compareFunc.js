import { buildCompareFunctionArbitrary } from './_internals/builders/CompareFunctionArbitraryBuilder.js';
export function compareFunc() {
    return buildCompareFunctionArbitrary(Object.assign((hA, hB) => hA - hB, {
        toString() {
            return '(hA, hB) => hA - hB';
        },
    }));
}

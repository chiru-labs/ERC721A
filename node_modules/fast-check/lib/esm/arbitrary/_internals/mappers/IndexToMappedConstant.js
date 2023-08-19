export function indexToMappedConstantMapperFor(entries) {
    return function indexToMappedConstantMapper(choiceIndex) {
        let idx = -1;
        let numSkips = 0;
        while (choiceIndex >= numSkips) {
            numSkips += entries[++idx].num;
        }
        return entries[idx].build(choiceIndex - numSkips + entries[idx].num);
    };
}
function buildReverseMapping(entries) {
    const reverseMapping = { mapping: new Map(), negativeZeroIndex: undefined };
    let choiceIndex = 0;
    for (let entryIdx = 0; entryIdx !== entries.length; ++entryIdx) {
        const entry = entries[entryIdx];
        for (let idxInEntry = 0; idxInEntry !== entry.num; ++idxInEntry) {
            const value = entry.build(idxInEntry);
            if (value === 0 && 1 / value === Number.NEGATIVE_INFINITY) {
                reverseMapping.negativeZeroIndex = choiceIndex;
            }
            else {
                reverseMapping.mapping.set(value, choiceIndex);
            }
            ++choiceIndex;
        }
    }
    return reverseMapping;
}
export function indexToMappedConstantUnmapperFor(entries) {
    let reverseMapping = null;
    return function indexToMappedConstantUnmapper(value) {
        if (reverseMapping === null) {
            reverseMapping = buildReverseMapping(entries);
        }
        const choiceIndex = Object.is(value, -0) ? reverseMapping.negativeZeroIndex : reverseMapping.mapping.get(value);
        if (choiceIndex === undefined) {
            throw new Error('Unknown value encountered cannot be built using this mapToConstant');
        }
        return choiceIndex;
    };
}

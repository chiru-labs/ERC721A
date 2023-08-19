export function wordsToJoinedStringMapper(words) {
    return words.map((w) => (w[w.length - 1] === ',' ? w.substr(0, w.length - 1) : w)).join(' ');
}
export function wordsToJoinedStringUnmapperFor(wordsArbitrary) {
    return function wordsToJoinedStringUnmapper(value) {
        if (typeof value !== 'string') {
            throw new Error('Unsupported type');
        }
        const words = [];
        for (const candidate of value.split(' ')) {
            if (wordsArbitrary.canShrinkWithoutContext(candidate))
                words.push(candidate);
            else if (wordsArbitrary.canShrinkWithoutContext(candidate + ','))
                words.push(candidate + ',');
            else
                throw new Error('Unsupported word');
        }
        return words;
    };
}
export function wordsToSentenceMapper(words) {
    let sentence = words.join(' ');
    if (sentence[sentence.length - 1] === ',') {
        sentence = sentence.substr(0, sentence.length - 1);
    }
    return sentence[0].toUpperCase() + sentence.substring(1) + '.';
}
export function wordsToSentenceUnmapperFor(wordsArbitrary) {
    return function wordsToSentenceUnmapper(value) {
        if (typeof value !== 'string') {
            throw new Error('Unsupported type');
        }
        if (value.length < 2 ||
            value[value.length - 1] !== '.' ||
            value[value.length - 2] === ',' ||
            value[0].toLowerCase().toUpperCase() !== value[0]) {
            throw new Error('Unsupported value');
        }
        const adaptedValue = value[0].toLowerCase() + value.substring(1, value.length - 1);
        const words = [];
        const candidates = adaptedValue.split(' ');
        for (let idx = 0; idx !== candidates.length; ++idx) {
            const candidate = candidates[idx];
            if (wordsArbitrary.canShrinkWithoutContext(candidate))
                words.push(candidate);
            else if (idx === candidates.length - 1 && wordsArbitrary.canShrinkWithoutContext(candidate + ','))
                words.push(candidate + ',');
            else
                throw new Error('Unsupported word');
        }
        return words;
    };
}
export function sentencesToParagraphMapper(sentences) {
    return sentences.join(' ');
}
export function sentencesToParagraphUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported type');
    }
    const sentences = value.split('. ');
    for (let idx = 0; idx < sentences.length - 1; ++idx) {
        sentences[idx] += '.';
    }
    return sentences;
}

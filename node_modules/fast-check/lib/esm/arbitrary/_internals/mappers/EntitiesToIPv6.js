function readBh(value) {
    if (value.length === 0)
        return [];
    else
        return value.split(':');
}
function extractEhAndL(value) {
    const valueSplits = value.split(':');
    if (valueSplits.length >= 2 && valueSplits[valueSplits.length - 1].length <= 4) {
        return [
            valueSplits.slice(0, valueSplits.length - 2),
            `${valueSplits[valueSplits.length - 2]}:${valueSplits[valueSplits.length - 1]}`,
        ];
    }
    return [valueSplits.slice(0, valueSplits.length - 1), valueSplits[valueSplits.length - 1]];
}
export function fullySpecifiedMapper(data) {
    return `${data[0].join(':')}:${data[1]}`;
}
export function fullySpecifiedUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    return extractEhAndL(value);
}
export function onlyTrailingMapper(data) {
    return `::${data[0].join(':')}:${data[1]}`;
}
export function onlyTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    if (!value.startsWith('::'))
        throw new Error('Invalid value');
    return extractEhAndL(value.substring(2));
}
export function multiTrailingMapper(data) {
    return `${data[0].join(':')}::${data[1].join(':')}:${data[2]}`;
}
export function multiTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    const [bhString, trailingString] = value.split('::', 2);
    const [eh, l] = extractEhAndL(trailingString);
    return [readBh(bhString), eh, l];
}
export function multiTrailingMapperOne(data) {
    return multiTrailingMapper([data[0], [data[1]], data[2]]);
}
export function multiTrailingUnmapperOne(value) {
    const out = multiTrailingUnmapper(value);
    return [out[0], out[1].join(':'), out[2]];
}
export function singleTrailingMapper(data) {
    return `${data[0].join(':')}::${data[1]}`;
}
export function singleTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    const [bhString, trailing] = value.split('::', 2);
    return [readBh(bhString), trailing];
}
export function noTrailingMapper(data) {
    return `${data[0].join(':')}::`;
}
export function noTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    if (!value.endsWith('::'))
        throw new Error('Invalid value');
    return [readBh(value.substring(0, value.length - 2))];
}

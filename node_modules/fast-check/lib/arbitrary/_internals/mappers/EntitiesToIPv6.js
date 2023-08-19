"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noTrailingUnmapper = exports.noTrailingMapper = exports.singleTrailingUnmapper = exports.singleTrailingMapper = exports.multiTrailingUnmapperOne = exports.multiTrailingMapperOne = exports.multiTrailingUnmapper = exports.multiTrailingMapper = exports.onlyTrailingUnmapper = exports.onlyTrailingMapper = exports.fullySpecifiedUnmapper = exports.fullySpecifiedMapper = void 0;
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
function fullySpecifiedMapper(data) {
    return `${data[0].join(':')}:${data[1]}`;
}
exports.fullySpecifiedMapper = fullySpecifiedMapper;
function fullySpecifiedUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    return extractEhAndL(value);
}
exports.fullySpecifiedUnmapper = fullySpecifiedUnmapper;
function onlyTrailingMapper(data) {
    return `::${data[0].join(':')}:${data[1]}`;
}
exports.onlyTrailingMapper = onlyTrailingMapper;
function onlyTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    if (!value.startsWith('::'))
        throw new Error('Invalid value');
    return extractEhAndL(value.substring(2));
}
exports.onlyTrailingUnmapper = onlyTrailingUnmapper;
function multiTrailingMapper(data) {
    return `${data[0].join(':')}::${data[1].join(':')}:${data[2]}`;
}
exports.multiTrailingMapper = multiTrailingMapper;
function multiTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    const [bhString, trailingString] = value.split('::', 2);
    const [eh, l] = extractEhAndL(trailingString);
    return [readBh(bhString), eh, l];
}
exports.multiTrailingUnmapper = multiTrailingUnmapper;
function multiTrailingMapperOne(data) {
    return multiTrailingMapper([data[0], [data[1]], data[2]]);
}
exports.multiTrailingMapperOne = multiTrailingMapperOne;
function multiTrailingUnmapperOne(value) {
    const out = multiTrailingUnmapper(value);
    return [out[0], out[1].join(':'), out[2]];
}
exports.multiTrailingUnmapperOne = multiTrailingUnmapperOne;
function singleTrailingMapper(data) {
    return `${data[0].join(':')}::${data[1]}`;
}
exports.singleTrailingMapper = singleTrailingMapper;
function singleTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    const [bhString, trailing] = value.split('::', 2);
    return [readBh(bhString), trailing];
}
exports.singleTrailingUnmapper = singleTrailingUnmapper;
function noTrailingMapper(data) {
    return `${data[0].join(':')}::`;
}
exports.noTrailingMapper = noTrailingMapper;
function noTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    if (!value.endsWith('::'))
        throw new Error('Invalid value');
    return [readBh(value.substring(0, value.length - 2))];
}
exports.noTrailingUnmapper = noTrailingUnmapper;

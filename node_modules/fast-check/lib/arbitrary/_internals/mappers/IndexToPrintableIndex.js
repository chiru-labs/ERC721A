"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexToPrintableIndexUnmapper = exports.indexToPrintableIndexMapper = void 0;
function indexToPrintableIndexMapper(v) {
    if (v < 95)
        return v + 0x20;
    if (v <= 0x7e)
        return v - 95;
    return v;
}
exports.indexToPrintableIndexMapper = indexToPrintableIndexMapper;
function indexToPrintableIndexUnmapper(v) {
    if (v >= 0x20 && v <= 0x7e)
        return v - 0x20;
    if (v >= 0 && v <= 0x1f)
        return v + 95;
    return v;
}
exports.indexToPrintableIndexUnmapper = indexToPrintableIndexUnmapper;

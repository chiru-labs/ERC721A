"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function getFilenameWithoutAnyExtensions(filePath) {
    const endPosition = filePath.indexOf(".");
    return filePath.slice(0, endPosition !== -1 ? endPosition : filePath.length);
}
exports.getFilenameWithoutAnyExtensions = getFilenameWithoutAnyExtensions;
/**
 * Both paths have to be file paths, not directories!
 * @param from
 * @param to
 */
function getRelativeModulePath(from, to) {
    const fromDir = path_1.dirname(from);
    const relativePathWithExtension = "./" + path_1.relative(fromDir, to);
    const extension = path_1.extname(relativePathWithExtension);
    const relativePathWithoutExtension = relativePathWithExtension.slice(0, -extension.length);
    return relativePathWithoutExtension;
}
exports.getRelativeModulePath = getRelativeModulePath;

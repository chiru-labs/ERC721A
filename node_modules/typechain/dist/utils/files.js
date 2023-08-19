"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileExtension = exports.getFilename = void 0;
const path_1 = require("path");
function getFilename(path) {
    return path_1.parse(path).name;
}
exports.getFilename = getFilename;
function getFileExtension(path) {
    return path_1.parse(path).ext;
}
exports.getFileExtension = getFileExtension;
//# sourceMappingURL=files.js.map
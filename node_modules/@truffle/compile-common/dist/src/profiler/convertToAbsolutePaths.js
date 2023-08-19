"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToAbsolutePaths = void 0;
const path_1 = __importDefault(require("path"));
const isExplicitlyRelative_1 = require("./isExplicitlyRelative");
function convertToAbsolutePaths(paths, base) {
    return paths
        .map(p => {
        // If it's anabsolute paths, leave it alone.
        if (path_1.default.isAbsolute(p))
            return p;
        // If it's not explicitly relative, then leave it alone (i.e., it's a module).
        if (!isExplicitlyRelative_1.isExplicitlyRelative(p))
            return p;
        // Path must be explicitly releative, therefore make it absolute.
        return path_1.default.resolve(path_1.default.join(base, p));
    })
        .sort();
}
exports.convertToAbsolutePaths = convertToAbsolutePaths;
//# sourceMappingURL=convertToAbsolutePaths.js.map
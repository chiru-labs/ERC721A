"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findImports = void 0;
function findImports(sources) {
    return (file) => {
        const result = sources.find((importFile) => importFile.url === file);
        if (result) {
            return { contents: result.source };
        }
        return { error: `File not found: ${file}` };
    };
}
exports.findImports = findImports;

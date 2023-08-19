"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExplicitlyRelative = void 0;
function isExplicitlyRelative(importPath) {
    return importPath.startsWith("./") || importPath.startsWith("../");
}
exports.isExplicitlyRelative = isExplicitlyRelative;
//# sourceMappingURL=isExplicitlyRelative.js.map
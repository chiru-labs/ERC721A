"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkFunction = void 0;
const path_1 = __importDefault(require("path"));
function getLinkFunction() {
    const wafflePath = require.resolve("ethereum-waffle");
    const waffleCompilerPath = path_1.default.dirname(require.resolve("@ethereum-waffle/compiler", {
        paths: [wafflePath],
    }));
    const waffleCompiler = require(path_1.default.join(waffleCompilerPath, "link"));
    return waffleCompiler.link;
}
exports.getLinkFunction = getLinkFunction;
//# sourceMappingURL=link.js.map
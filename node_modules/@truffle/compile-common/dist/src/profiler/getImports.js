"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImports = void 0;
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const debug = debug_1.default("compile-common:profiler:getImports");
function getImports({ source: { filePath, body, source }, shouldIncludePath, parseImports }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!shouldIncludePath(filePath) || !parseImports)
            return [];
        debug("filePath: %s", filePath);
        const imports = yield parseImports(body);
        debug("imports: %O", imports);
        // Convert relative dependencies of modules back into module paths.
        // note: the check for what's a relative dependency has been removed from
        // here, that's now the responsibility of the individual resolverSource to check
        return (yield Promise.all(imports.map(dependencyPath => source.resolveDependencyPath(filePath, dependencyPath)))).filter(sourcePath => sourcePath) //filter out Vyper failures
            .map(sourcePath => sourcePath.replace(/\//g, path_1.default.sep)); //make sure to use
        //backslash on Windows (for same reason as in requiredSources.ts)
    });
}
exports.getImports = getImports;
//# sourceMappingURL=getImports.js.map
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
exports.resolveAllSources = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("compile-common:profiler:resolveAllSources");
const getImports_1 = require("./getImports");
// Resolves sources in several async passes. For each resolved set it detects unknown
// imports from external packages and adds them to the set of files to resolve.
function resolveAllSources({ resolve, paths, shouldIncludePath, parseImports }) {
    return __awaiter(this, void 0, void 0, function* () {
        const mapping = {};
        const allPaths = paths.slice();
        debug("resolveAllSources called");
        // Begin generateMapping
        function generateMapping() {
            return __awaiter(this, void 0, void 0, function* () {
                const promises = [];
                // Dequeue all the known paths, generating resolver promises,
                // We'll add paths if we discover external package imports.
                while (allPaths.length) {
                    let filePath;
                    let importedFrom = null;
                    const candidate = allPaths.shift();
                    // Some paths will have been extracted as imports from a file
                    // and have information about their parent location we need to track.
                    if (typeof candidate === "object") {
                        filePath = candidate.filePath;
                        importedFrom = candidate.importedFrom;
                    }
                    else {
                        filePath = candidate;
                    }
                    promises.push(resolve({ filePath, importedFrom }));
                }
                // Resolve everything known and add it to the map, then inspect each file's
                // imports and add those to the list of paths to resolve if we don't have it.
                const results = yield Promise.all(promises);
                // Queue unknown imports for the next resolver cycle
                while (results.length) {
                    const source = results.shift();
                    if (!source || mapping[source.filePath]) {
                        //skip ones that couldn't be resolved, or are already recorded
                        continue;
                    }
                    const imports = shouldIncludePath(source.filePath)
                        ? yield getImports_1.getImports({ source, parseImports, shouldIncludePath })
                        : [];
                    debug("imports: %O", imports);
                    // Generate the sources mapping
                    mapping[source.filePath] = Object.assign(Object.assign({}, source), { imports });
                    // Detect unknown external packages / add them to the list of files to resolve
                    // Keep track of location of this import because we need to report that.
                    for (const item of imports) {
                        if (!mapping[item]) {
                            allPaths.push({ filePath: item, importedFrom: source.filePath });
                        }
                    }
                }
            });
        }
        // End generateMapping
        while (allPaths.length) {
            yield generateMapping();
        }
        return mapping;
    });
}
exports.resolveAllSources = resolveAllSources;
//# sourceMappingURL=resolveAllSources.js.map
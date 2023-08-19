"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectSources = void 0;
const path = __importStar(require("path"));
/**
 * Collects sources, targets into collections with OS-independent paths,
 * along with a reverse mapping to the original path (for post-processing)
 *
 * @param originalSources - { [originalSourcePath]: contents }
 * @param originalTargets - originalSourcePath[]
 * @param baseDirectory - a directory to remove as a prefix
 * @param replacement - what to replace it with
 * @return { sources, targets, originalSourcePaths }
 */
function collectSources(originalSources, originalTargets = [], baseDirectory = "", replacement = "/") {
    const mappedResults = Object.entries(originalSources)
        .filter(([originalSourcePath, _]) => !path.isAbsolute(originalSourcePath) ||
        originalSourcePath.startsWith(baseDirectory))
        .map(([originalSourcePath, contents]) => ({
        originalSourcePath,
        contents,
        sourcePath: getPortableSourcePath(replaceRootDirectory(originalSourcePath, baseDirectory, replacement))
    }))
        .map(({ originalSourcePath, sourcePath, contents }) => ({
        sources: {
            [sourcePath]: contents
        },
        // include transformed form as target if original is a target
        targets: originalTargets.includes(originalSourcePath) ? [sourcePath] : [],
        originalSourcePaths: {
            [sourcePath]: originalSourcePath
        }
    }));
    const defaultAccumulator = {
        sources: {},
        targets: [],
        originalSourcePaths: {}
    };
    return mappedResults.reduce((accumulator, result) => ({
        sources: Object.assign({}, accumulator.sources, result.sources),
        targets: [...accumulator.targets, ...result.targets],
        originalSourcePaths: Object.assign({}, accumulator.originalSourcePaths, result.originalSourcePaths)
    }), defaultAccumulator);
}
exports.collectSources = collectSources;
/**
 * @param sourcePath - string
 * @return string - operating system independent path
 * @private
 */
function getPortableSourcePath(sourcePath) {
    let replacement = sourcePath;
    //on Windows, replace backslashes with forward slashes
    if (path.sep === '\\') {
        replacement = sourcePath.replace(/\\/g, "/");
    }
    // Turn G:/.../ into /G/.../ for Windows
    if (replacement.length >= 2 && replacement[1] === ":") {
        replacement = "/" + replacement;
        replacement = replacement.replace(":", "");
    }
    return replacement;
}
function replaceRootDirectory(sourcePath, rootDirectory, replacement) {
    //make sure root directory ends in a separator
    if (!rootDirectory.endsWith(path.sep)) {
        rootDirectory = rootDirectory + path.sep;
    }
    return sourcePath.startsWith(rootDirectory)
        ? replacement + sourcePath.slice(rootDirectory.length) //remove prefix
        : sourcePath;
}
//# sourceMappingURL=sources.js.map
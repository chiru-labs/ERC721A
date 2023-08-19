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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updated = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function updated({ paths, contractsBuildDirectory, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const sourceFilesArtifacts = readAndParseArtifactFiles(paths, contractsBuildDirectory);
        const sourceFilesArtifactsUpdatedTimes = minimumUpdatedTimePerSource(sourceFilesArtifacts);
        return findUpdatedFiles(sourceFilesArtifacts, sourceFilesArtifactsUpdatedTimes);
    });
}
exports.updated = updated;
function readAndParseArtifactFiles(paths, contracts_build_directory) {
    const sourceFilesArtifacts = {};
    // Get all the source files and create an object out of them.
    paths.forEach((sourceFile) => {
        sourceFilesArtifacts[sourceFile] = [];
    });
    // Get all the artifact files, and read them, parsing them as JSON
    let buildFiles;
    try {
        buildFiles = fs.readdirSync(contracts_build_directory);
    }
    catch (error) {
        // The build directory may not always exist.
        if (error.message.includes("ENOENT: no such file or directory")) {
            // Ignore it.
            buildFiles = [];
        }
        else {
            throw error;
        }
    }
    buildFiles = buildFiles.filter((file) => path.extname(file) === ".json");
    const jsonData = buildFiles.map((file) => {
        const body = fs.readFileSync(path.join(contracts_build_directory, file), "utf8");
        return { file, body };
    });
    for (let i = 0; i < jsonData.length; i++) {
        try {
            const data = JSON.parse(jsonData[i].body);
            // In case there are artifacts from other source locations.
            if (sourceFilesArtifacts[data.sourcePath] == null) {
                sourceFilesArtifacts[data.sourcePath] = [];
            }
            sourceFilesArtifacts[data.sourcePath].push(data);
        }
        catch (error) {
            // JSON.parse throws SyntaxError objects
            if (error instanceof SyntaxError) {
                throw new Error("Problem parsing artifact: " + jsonData[i].file);
            }
            else {
                throw error;
            }
        }
    }
    return sourceFilesArtifacts;
}
function findUpdatedFiles(sourceFilesArtifacts, sourceFilesArtifactsUpdatedTimes) {
    // Stat all the source files, getting there updated times, and comparing them to
    // the artifact updated times.
    const sourceFiles = Object.keys(sourceFilesArtifacts);
    let sourceFileStats;
    sourceFileStats = sourceFiles.map((file) => {
        try {
            return fs.statSync(file);
        }
        catch (error) {
            // Ignore it. This means the source file was removed
            // but the artifact file possibly exists. Return null
            // to signfy that we should ignore it.
            return null;
        }
    });
    return sourceFiles
        .map((sourceFile, index) => {
        const sourceFileStat = sourceFileStats[index];
        // Ignore updating artifacts if source file has been removed.
        if (sourceFileStat == null)
            return;
        const artifactsUpdatedTime = sourceFilesArtifactsUpdatedTimes[sourceFile] || 0;
        const sourceFileUpdatedTime = (sourceFileStat.mtime || sourceFileStat.ctime).getTime();
        if (sourceFileUpdatedTime > artifactsUpdatedTime)
            return sourceFile;
    })
        .filter((file) => file);
}
function minimumUpdatedTimePerSource(sourceFilesArtifacts) {
    let sourceFilesArtifactsUpdatedTimes = {};
    // Get the minimum updated time for all of a source file's artifacts
    // (note: one source file might have multiple artifacts).
    for (const sourceFile of Object.keys(sourceFilesArtifacts)) {
        const artifacts = sourceFilesArtifacts[sourceFile];
        sourceFilesArtifactsUpdatedTimes[sourceFile] = artifacts.reduce((minimum, current) => {
            const updatedAt = new Date(current.updatedAt).getTime();
            if (updatedAt < minimum) {
                return updatedAt;
            }
            return minimum;
        }, Number.MAX_SAFE_INTEGER);
        // Empty array?
        if (sourceFilesArtifactsUpdatedTimes[sourceFile] === Number.MAX_SAFE_INTEGER) {
            sourceFilesArtifactsUpdatedTimes[sourceFile] = 0;
        }
    }
    return sourceFilesArtifactsUpdatedTimes;
}
//# sourceMappingURL=updated.js.map
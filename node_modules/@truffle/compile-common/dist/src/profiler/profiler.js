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
exports.Profiler = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("compile-common:profiler");
const findContracts = require("@truffle/contract-sources");
const expect = require("@truffle/expect");
const updated_1 = require("./updated");
const requiredSources_1 = require("./requiredSources");
const convertToAbsolutePaths_1 = require("./convertToAbsolutePaths");
class Profiler {
    constructor(config) {
        this.config = config;
    }
    updated(options) {
        return __awaiter(this, void 0, void 0, function* () {
            expect.options(options, [
                "contracts_directory",
                "contracts_build_directory"
            ]);
            const { contracts_directory: contractsDirectory, contracts_build_directory: contractsBuildDirectory } = options;
            const paths = options.files
                ? options.files
                : yield findContracts(contractsDirectory);
            return yield updated_1.updated({ paths, contractsBuildDirectory });
        });
    }
    requiredSources(options) {
        return __awaiter(this, void 0, void 0, function* () {
            expect.options(options, [
                "paths",
                "base_path",
                "resolver",
                "contracts_directory"
            ]);
            const { resolver, paths, base_path: basePath, contracts_directory: contractsDirectory } = options;
            debug("paths: %O", paths);
            const resolve = ({ filePath, importedFrom }) => __awaiter(this, void 0, void 0, function* () {
                //we want to allow resolution failure here.  so, if a source can't
                //be resolved, it will show up as a compile error rather than a Truffle
                //error.
                try {
                    return yield resolver.resolve(filePath, importedFrom);
                }
                catch (error) {
                    //resolver doesn't throw structured errors at the moment,
                    //so we'll check the messag to see whether this is an expected error
                    //(kind of a HACK)
                    if (error.message.startsWith("Could not find ")) {
                        return undefined;
                    }
                    else {
                        //rethrow unexpected errors
                        throw error;
                    }
                }
            });
            const updatedPaths = convertToAbsolutePaths_1.convertToAbsolutePaths(paths, basePath);
            const allPaths = convertToAbsolutePaths_1.convertToAbsolutePaths(yield findContracts(contractsDirectory), basePath);
            debug("invoking requiredSources");
            return yield requiredSources_1.requiredSources({
                resolve,
                parseImports: this.config.parseImports,
                shouldIncludePath: this.config.shouldIncludePath,
                updatedPaths,
                allPaths
            });
        });
    }
    requiredSourcesForSingleFile(options) {
        return __awaiter(this, void 0, void 0, function* () {
            expect.options(options, ["path", "base_path", "resolver"]);
            const { resolver, path, base_path: basePath } = options;
            const resolve = ({ filePath, importedFrom }) => resolver.resolve(filePath, importedFrom);
            const allPaths = convertToAbsolutePaths_1.convertToAbsolutePaths([path], basePath);
            const updatedPaths = allPaths;
            return yield requiredSources_1.requiredSources({
                resolve,
                parseImports: this.config.parseImports,
                shouldIncludePath: this.config.shouldIncludePath,
                updatedPaths,
                allPaths
            });
        });
    }
}
exports.Profiler = Profiler;
//# sourceMappingURL=profiler.js.map
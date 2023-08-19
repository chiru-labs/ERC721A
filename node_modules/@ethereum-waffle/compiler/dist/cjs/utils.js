"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEmptyDirsRecursively = exports.insert = exports.getExtensionForCompilerType = exports.isDirectory = exports.isFile = exports.readFileContent = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readFileContent = (path) => fs_1.default.readFileSync(path).toString();
exports.readFileContent = readFileContent;
const isFile = (filePath) => fs_1.default.existsSync(filePath) && fs_1.default.lstatSync(filePath).isFile();
exports.isFile = isFile;
const isDirectory = (directoryPath) => fs_1.default.existsSync(path_1.default.resolve(directoryPath)) &&
    fs_1.default.statSync(path_1.default.resolve(directoryPath)).isDirectory();
exports.isDirectory = isDirectory;
const getExtensionForCompilerType = (config) => {
    return config.compilerType === 'dockerized-vyper' ? '.vy' : '.sol';
};
exports.getExtensionForCompilerType = getExtensionForCompilerType;
const insert = (source, insertedValue, index) => `${source.slice(0, index)}${insertedValue}${source.slice(index)}`;
exports.insert = insert;
const removeEmptyDirsRecursively = (directoryPath) => {
    if (!exports.isDirectory(directoryPath)) {
        return;
    }
    let files = fs_1.default.readdirSync(directoryPath);
    if (files.length > 0) {
        files.forEach((file) => {
            const filePath = path_1.default.join(directoryPath, file);
            exports.removeEmptyDirsRecursively(filePath);
        });
        // Re-evaluate files as after deleting a subdirectory we may have parent directory empty now
        files = fs_1.default.readdirSync(directoryPath);
    }
    if (files.length === 0) {
        fs_1.default.rmdirSync(directoryPath);
    }
};
exports.removeEmptyDirsRecursively = removeEmptyDirsRecursively;

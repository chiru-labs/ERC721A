"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInputs = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
function findInputs(sourcePath, extension) {
    const stack = [sourcePath];
    const inputFiles = [];
    while (stack.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const dir = stack.pop();
        const files = fs_1.default.readdirSync(dir);
        for (const file of files) {
            const filePath = path_1.default.join(dir, file);
            if (utils_1.isDirectory(filePath)) {
                stack.push(filePath);
            }
            else if (file.endsWith(extension)) {
                inputFiles.push(filePath);
            }
        }
    }
    return inputFiles;
}
exports.findInputs = findInputs;

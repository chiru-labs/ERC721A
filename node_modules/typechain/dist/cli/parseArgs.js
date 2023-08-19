"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = void 0;
const command_line_args_1 = __importDefault(require("command-line-args"));
const DEFAULT_GLOB_PATTERN = '**/*.abi';
function parseArgs() {
    const optionDefinitions = [
        { name: 'glob', type: String, defaultOption: true },
        { name: 'target', type: String },
        { name: 'outDir', type: String },
        { name: 'show-stack-traces', type: Boolean },
    ];
    const rawOptions = command_line_args_1.default(optionDefinitions);
    return {
        files: rawOptions.glob || DEFAULT_GLOB_PATTERN,
        outDir: rawOptions.outDir,
        target: rawOptions.target,
    };
}
exports.parseArgs = parseArgs;
//# sourceMappingURL=parseArgs.js.map
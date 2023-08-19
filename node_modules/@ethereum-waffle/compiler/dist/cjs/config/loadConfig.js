"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function loadConfig(configPath) {
    if (configPath) {
        return require(path_1.default.join(process.cwd(), configPath));
    }
    else if (fs_1.default.existsSync('./waffle.json')) {
        return require(path_1.default.join(process.cwd(), './waffle.json'));
    }
    else {
        return {};
    }
}
exports.loadConfig = loadConfig;

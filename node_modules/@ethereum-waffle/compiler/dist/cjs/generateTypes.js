"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTypes = void 0;
const path_1 = __importDefault(require("path"));
const ts_generator_1 = require("ts-generator");
const TypeChain_1 = require("typechain/dist/TypeChain");
async function generateTypes(config) {
    await ts_generator_1.tsGenerator({ cwd: config.outputDirectory }, new TypeChain_1.TypeChain({
        cwd: config.outputDirectory,
        rawConfig: { files: '*.json', outDir: config.typechainOutputDir, target: 'ethers-v5' }
    }));
    return path_1.default.join(config.outputDirectory, config.typechainOutputDir);
}
exports.generateTypes = generateTypes;

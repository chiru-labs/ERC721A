"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildCommand = exports.compileNativeSolc = void 0;
const path_1 = require("path");
const compilerInput_1 = require("./compilerInput");
const executeCommand_1 = require("./executeCommand");
function compileNativeSolc(config) {
    return async function compile(sources) {
        const command = createBuildCommand(config);
        const input = compilerInput_1.getCompilerInput(sources, config.compilerOptions, 'Solidity');
        const output = await executeCommand_1.executeCommand(command, input);
        return JSON.parse(output);
    };
}
exports.compileNativeSolc = compileNativeSolc;
function createBuildCommand(config) {
    const command = 'solc';
    const params = '--standard-json';
    const customAllowedPaths = config.compilerAllowedPaths
        .map((path) => path_1.resolve(path));
    const allowedPaths = [
        path_1.resolve(config.sourceDirectory),
        path_1.resolve(config.nodeModulesDirectory),
        ...customAllowedPaths
    ];
    return `${command} ${params} --allow-paths ${allowedPaths.join(',')}`;
}
exports.createBuildCommand = createBuildCommand;

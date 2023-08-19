"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVolumes = exports.createBuildCommand = exports.compileDockerSolc = void 0;
const path_1 = require("path");
const compilerInput_1 = require("./compilerInput");
const executeCommand_1 = require("./executeCommand");
const CONTAINER_PATH = '/home/project';
const NPM_PATH = '/home/npm';
function compileDockerSolc(config) {
    return async function compile(sources) {
        const command = createBuildCommand(config);
        const input = compilerInput_1.getCompilerInput(sources, config.compilerOptions, 'Solidity');
        const output = await executeCommand_1.executeCommand(command, input);
        return JSON.parse(output);
    };
}
exports.compileDockerSolc = compileDockerSolc;
function createBuildCommand(config) {
    const tag = config.compilerVersion || 'stable';
    const allowedPaths = `"${CONTAINER_PATH},${NPM_PATH}"`;
    return `docker run ${getVolumes(config)} -i -a stdin -a stdout ` +
        `ethereum/solc:${tag} solc --standard-json --allow-paths ${allowedPaths}`;
}
exports.createBuildCommand = createBuildCommand;
function getVolumes(config) {
    const hostPath = process.cwd();
    const hostNpmPath = path_1.join(hostPath, config.nodeModulesDirectory);
    return `-v ${hostPath}:${CONTAINER_PATH} -v ${hostNpmPath}:${NPM_PATH}`;
}
exports.getVolumes = getVolumes;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildCommand = exports.compileDockerVyper = void 0;
const compilerInput_1 = require("./compilerInput");
const executeCommand_1 = require("./executeCommand");
const CONTAINER_PATH = '/project';
function compileDockerVyper(config) {
    return async function compile(sources) {
        const command = createBuildCommand(config);
        const input = compilerInput_1.getCompilerInput(sources, config.compilerOptions, 'Vyper');
        const output = await executeCommand_1.executeCommand(command, input);
        return JSON.parse(output);
    };
}
exports.compileDockerVyper = compileDockerVyper;
function createBuildCommand(config) {
    const tag = config.compilerVersion || 'stable';
    const volumes = `-v ${process.cwd()}:${CONTAINER_PATH}`;
    return `docker run ${volumes} -i -a stdin -a stdout ` +
        `-w ${CONTAINER_PATH} --entrypoint vyper-json vyperlang/vyper:${tag}`;
}
exports.createBuildCommand = createBuildCommand;

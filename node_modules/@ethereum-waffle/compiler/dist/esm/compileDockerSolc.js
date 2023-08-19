import { join } from 'path';
import { getCompilerInput } from './compilerInput';
import { executeCommand } from './executeCommand';
const CONTAINER_PATH = '/home/project';
const NPM_PATH = '/home/npm';
export function compileDockerSolc(config) {
    return async function compile(sources) {
        const command = createBuildCommand(config);
        const input = getCompilerInput(sources, config.compilerOptions, 'Solidity');
        const output = await executeCommand(command, input);
        return JSON.parse(output);
    };
}
export function createBuildCommand(config) {
    const tag = config.compilerVersion || 'stable';
    const allowedPaths = `"${CONTAINER_PATH},${NPM_PATH}"`;
    return `docker run ${getVolumes(config)} -i -a stdin -a stdout ` +
        `ethereum/solc:${tag} solc --standard-json --allow-paths ${allowedPaths}`;
}
export function getVolumes(config) {
    const hostPath = process.cwd();
    const hostNpmPath = join(hostPath, config.nodeModulesDirectory);
    return `-v ${hostPath}:${CONTAINER_PATH} -v ${hostNpmPath}:${NPM_PATH}`;
}

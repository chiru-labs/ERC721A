import { resolve } from 'path';
import { getCompilerInput } from './compilerInput';
import { executeCommand } from './executeCommand';
export function compileNativeSolc(config) {
    return async function compile(sources) {
        const command = createBuildCommand(config);
        const input = getCompilerInput(sources, config.compilerOptions, 'Solidity');
        const output = await executeCommand(command, input);
        return JSON.parse(output);
    };
}
export function createBuildCommand(config) {
    const command = 'solc';
    const params = '--standard-json';
    const customAllowedPaths = config.compilerAllowedPaths
        .map((path) => resolve(path));
    const allowedPaths = [
        resolve(config.sourceDirectory),
        resolve(config.nodeModulesDirectory),
        ...customAllowedPaths
    ];
    return `${command} ${params} --allow-paths ${allowedPaths.join(',')}`;
}

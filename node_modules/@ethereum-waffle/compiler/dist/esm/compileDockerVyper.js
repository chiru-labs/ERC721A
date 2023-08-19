import { getCompilerInput } from './compilerInput';
import { executeCommand } from './executeCommand';
const CONTAINER_PATH = '/project';
export function compileDockerVyper(config) {
    return async function compile(sources) {
        const command = createBuildCommand(config);
        const input = getCompilerInput(sources, config.compilerOptions, 'Vyper');
        const output = await executeCommand(command, input);
        return JSON.parse(output);
    };
}
export function createBuildCommand(config) {
    const tag = config.compilerVersion || 'stable';
    const volumes = `-v ${process.cwd()}:${CONTAINER_PATH}`;
    return `docker run ${volumes} -i -a stdin -a stdout ` +
        `-w ${CONTAINER_PATH} --entrypoint vyper-json vyperlang/vyper:${tag}`;
}

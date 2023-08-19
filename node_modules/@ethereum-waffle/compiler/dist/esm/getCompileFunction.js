import { compileSolcjs } from './compileSolcjs';
import { compileNativeSolc } from './compileNativeSolc';
import { compileDockerSolc } from './compileDockerSolc';
import { compileDockerVyper } from './compileDockerVyper';
export function getCompileFunction(config) {
    switch (config.compilerType) {
        case 'solcjs': return compileSolcjs(config);
        case 'native': return compileNativeSolc(config);
        case 'dockerized-solc': return compileDockerSolc(config);
        case 'dockerized-vyper': return compileDockerVyper(config);
        default: throw new Error(`Unknown compiler ${config.compilerType}`);
    }
}

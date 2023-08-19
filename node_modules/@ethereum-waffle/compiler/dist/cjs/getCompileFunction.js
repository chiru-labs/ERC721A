"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompileFunction = void 0;
const compileSolcjs_1 = require("./compileSolcjs");
const compileNativeSolc_1 = require("./compileNativeSolc");
const compileDockerSolc_1 = require("./compileDockerSolc");
const compileDockerVyper_1 = require("./compileDockerVyper");
function getCompileFunction(config) {
    switch (config.compilerType) {
        case 'solcjs': return compileSolcjs_1.compileSolcjs(config);
        case 'native': return compileNativeSolc_1.compileNativeSolc(config);
        case 'dockerized-solc': return compileDockerSolc_1.compileDockerSolc(config);
        case 'dockerized-vyper': return compileDockerVyper_1.compileDockerVyper(config);
        default: throw new Error(`Unknown compiler ${config.compilerType}`);
    }
}
exports.getCompileFunction = getCompileFunction;

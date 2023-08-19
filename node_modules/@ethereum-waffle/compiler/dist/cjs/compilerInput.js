"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompilerInput = void 0;
function getCompilerInput(files, overrides = {}, language) {
    const sources = {};
    for (const file of files) {
        sources[file.url] = { content: file.source };
    }
    return JSON.stringify({
        language,
        sources,
        settings: {
            outputSelection: { '*': { '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'] } },
            ...overrides
        }
    });
}
exports.getCompilerInput = getCompilerInput;

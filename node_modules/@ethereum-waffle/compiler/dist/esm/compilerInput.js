export function getCompilerInput(files, overrides = {}, language) {
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

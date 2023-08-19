"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forBytecode = exports.forContract = exports.forContracts = void 0;
function forContracts(contracts) {
    // convert to list
    return Object.values(contracts).map(forContract);
}
exports.forContracts = forContracts;
function forContract(contract) {
    const { contractName, contract_name, sourcePath, source, sourceMap, deployedSourceMap, legacyAST, ast, abi, metadata, bytecode, deployedBytecode, compiler, devdoc, userdoc, immutableReferences, generatedSources, deployedGeneratedSources, db } = contract;
    return {
        contractName: contract_name || contractName,
        sourcePath,
        source,
        sourceMap,
        deployedSourceMap,
        legacyAST,
        ast,
        abi,
        metadata,
        bytecode: forBytecode(bytecode),
        deployedBytecode: forBytecode(deployedBytecode),
        compiler,
        devdoc,
        userdoc,
        immutableReferences,
        generatedSources,
        deployedGeneratedSources,
        db
    };
}
exports.forContract = forContract;
function forBytecode(bytecode) {
    if (!bytecode) {
        return undefined;
    }
    if (typeof bytecode === "object") {
        return bytecode;
    }
    const linkReferences = [];
    const bytes = bytecode
        .slice(2) // remove 0x prefix
        .replace(/__[^_]+_*/g, (linkReference, characterOffset) => {
        const [, name] = linkReference.match(/__([^_]+)_*/);
        const characterLength = linkReference.length;
        const offset = characterOffset / 2;
        const length = characterLength / 2;
        linkReferences.push({
            offsets: [offset],
            name,
            length
        });
        return "0".repeat(characterLength);
    });
    return { bytes, linkReferences };
}
exports.forBytecode = forBytecode;
//# sourceMappingURL=LegacyToNew.js.map
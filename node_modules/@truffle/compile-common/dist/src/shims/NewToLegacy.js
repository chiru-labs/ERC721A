"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forBytecode = exports.forContract = void 0;
function forContract(contract) {
    const { contractName, sourcePath, source, sourceMap, deployedSourceMap, legacyAST, ast, abi, metadata, bytecode, deployedBytecode, compiler, devdoc, userdoc, immutableReferences, generatedSources, deployedGeneratedSources, db } = contract;
    return {
        contract_name: contractName,
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
        unlinked_binary: forBytecode(bytecode),
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
        return bytecode;
    }
    if (typeof bytecode === "string") {
        return bytecode;
    }
    let { bytes, linkReferences } = bytecode;
    linkReferences = linkReferences || [];
    // inline link references - start by flattening the offsets
    const flattenedLinkReferences = linkReferences
        // map each link ref to array of link refs with only one offset
        .map(({ offsets, length, name }) => offsets.map(offset => ({ offset, length, name })))
        // flatten
        .reduce((a, b) => [...a, ...b], []);
    // then overwite bytes with link reference
    bytes = flattenedLinkReferences.reduce((bytes, { offset, name, length }) => {
        // length is a byte offset
        const characterLength = length * 2;
        let linkId = `__${name.slice(0, characterLength - 2)}`;
        while (linkId.length < characterLength) {
            linkId += "_";
        }
        const start = offset * 2;
        return `${bytes.substring(0, start)}${linkId}${bytes.substring(start + characterLength)}`;
    }, bytes);
    return `0x${bytes}`;
}
exports.forBytecode = forBytecode;
//# sourceMappingURL=NewToLegacy.js.map
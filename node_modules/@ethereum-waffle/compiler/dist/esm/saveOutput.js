import { join } from 'path';
import fs from 'fs';
import { getHumanReadableAbi } from './getHumanReadableAbi';
import mkdirp from 'mkdirp';
const fsOps = {
    createDirectory: mkdirp.sync,
    writeFile: fs.writeFileSync
};
export async function saveOutput(output, config, filesystem = fsOps) {
    config.outputType = config.outputType || 'multiple';
    filesystem.createDirectory(config.outputDirectory);
    if (['multiple', 'all'].includes(config.outputType)) {
        saveOutputSingletons(output, config, filesystem);
    }
    if (['combined', 'all'].includes(config.outputType)) {
        saveOutputCombined(output, config, filesystem);
    }
    if (['minimal'].includes(config.outputType)) {
        saveOutputMinimal(output, config, filesystem);
    }
}
async function saveOutputMinimal(output, config, filesystem = fsOps) {
    for (const [, file] of Object.entries(output.contracts)) {
        for (const [contractName, contractJson] of Object.entries(file)) {
            const filePath = join(config.outputDirectory, `${contractName}.json`);
            filesystem.writeFile(filePath, getMinimalContent(contractJson, config));
        }
    }
}
function getMinimalContent(contractJson, config) {
    const abi = config.outputHumanReadableAbi
        ? getHumanReadableAbi(contractJson.abi)
        : contractJson.abi;
    const bytecode = contractJson.evm.bytecode.object;
    return JSON.stringify({ abi, bytecode }, null, 2);
}
async function saveOutputSingletons(output, config, filesystem = fsOps) {
    for (const [, file] of Object.entries(output.contracts)) {
        for (const [contractName, contractJson] of Object.entries(file)) {
            const filePath = join(config.outputDirectory, `${contractName}.json`);
            filesystem.writeFile(filePath, getContent(contractJson, config));
        }
    }
}
async function saveOutputCombined(output, config, filesystem = fsOps) {
    for (const [key, file] of Object.entries(output.contracts)) {
        for (const [contractName, contractJson] of Object.entries(file)) {
            contractJson.bin = contractJson.evm.bytecode.object;
            contractJson['bin-runtime'] = contractJson.evm.deployedBytecode.object;
            contractJson.srcmap = contractJson.evm.bytecode.sourceMap;
            contractJson['srcmap-runtime'] = contractJson.evm.deployedBytecode.sourceMap;
            output.contracts[String(key) + ':' + String(contractName)] = contractJson;
        }
        delete output.contracts[key];
    }
    const allSources = [];
    for (const [key, value] of Object.entries(output.sources)) {
        value.AST = value.ast;
        delete value.ast;
        allSources.push(key);
    }
    output.sourceList = allSources;
    filesystem.writeFile(join(config.outputDirectory, 'Combined-Json.json'), JSON.stringify(output, null, 2));
}
function getContent(contractJson, config) {
    contractJson.bytecode = contractJson.evm.bytecode.object;
    if (config.outputHumanReadableAbi) {
        contractJson.humanReadableAbi = getHumanReadableAbi(contractJson.abi);
    }
    return JSON.stringify(contractJson, null, 2);
}

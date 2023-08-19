import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { inputToConfig, loadConfig } from './config';
import { ImportsFsEngine, resolvers } from '@resolver-engine/imports-fs';
import { gatherSourcesAndCanonizeImports } from '@resolver-engine/imports';
import { findInputs } from './findInputs';
import { getExtensionForCompilerType, insert } from './utils';
export async function flattenProject(configPath) {
    await flattenAndSave(await loadConfig(configPath));
}
export async function flattenAndSave(input) {
    const config = inputToConfig(input);
    const output = await getContractDependency(config);
    await saveToFile(output, config);
}
const getFileName = (rootContract) => path.parse(rootContract.url).base;
const getFilePath = (fileName, outputDirectory) => path.join(outputDirectory, fileName);
export async function flattenSingleFile(input, name) {
    const config = inputToConfig(input);
    const output = await getContractDependency(config);
    const contract = output.find((contracts) => getFileName(contracts[contracts.length - 1]) === name);
    if (!contract) {
        return null;
    }
    return getFlattenedSource(contract, '').sourceWithNormalizedLicences;
}
async function getContractDependency(config) {
    const resolver = ImportsFsEngine().addResolver(resolvers.BacktrackFsResolver(config.nodeModulesDirectory));
    const allContracts = findInputs(config.sourceDirectory, getExtensionForCompilerType(config));
    return Promise.all(allContracts.map(async (contract) => gatherSourcesAndCanonizeImports([contract], '.', resolver)));
}
const fsOps = {
    createDirectory: mkdirp.sync,
    writeFile: fs.writeFileSync
};
const unique = (arr) => [...new Set(arr)];
function getFlattenedSource(contract, outputDirectory) {
    const rootContract = contract[contract.length - 1];
    const fileName = getFileName(rootContract);
    const filePath = getFilePath(fileName, outputDirectory);
    const contractsWithCommentedDirectives = contract.map(replaceDirectivesWithComments(rootContract));
    const source = ''.concat(...unique(contractsWithCommentedDirectives));
    const sourceWithNormalizedLicences = normalizeSpdxLicenceIdentifiers(source, fileName);
    return { filePath, sourceWithNormalizedLicences };
}
function saveToFile(output, config, fileSystem = fsOps) {
    const outputDirectory = config.flattenOutputDirectory;
    fileSystem.createDirectory(outputDirectory);
    output.map((contract) => {
        const { filePath, sourceWithNormalizedLicences } = getFlattenedSource(contract, outputDirectory);
        fileSystem.writeFile(filePath, sourceWithNormalizedLicences);
    });
}
function replaceDirectivesWithComments(rootContract) {
    const IMPORT_SOLIDITY_REGEX = /^[ \t]*import[^=]+?$/gm;
    const IMPORT_NODE_MODULES_REGEX = /(import.*").*node_modules\/(.*\n)/gi;
    const PRAGMA_SOLIDITY_REGEX = /pragma solidity/gi;
    const NODE_MODULES_REGEX = /^.*\/node_modules\//gi;
    return (dependency) => {
        const sourceWithImportsWithRelativeImports = dependency.source.replace(IMPORT_NODE_MODULES_REGEX, '$1$2');
        const sourceWithCommentedImports = sourceWithImportsWithRelativeImports.replace(IMPORT_SOLIDITY_REGEX, '// $&');
        const filePath = dependency.url.replace(NODE_MODULES_REGEX, '');
        if (dependency === rootContract) {
            return `// Root file: ${filePath}\n\n` + sourceWithCommentedImports;
        }
        const sourceWithCommentedPragmas = sourceWithCommentedImports.replace(PRAGMA_SOLIDITY_REGEX, '// pragma solidity');
        return `// Dependency file: ${filePath}\n\n` + sourceWithCommentedPragmas + '\n\n';
    };
}
function findUniqueLicences(flattenContracts) {
    const LICENCE_REGEX = /^\s*\/\/\s*SPDX-License-Identifier:(.*)$/mg;
    const licences = new Set();
    let match;
    while (true) {
        match = LICENCE_REGEX.exec(flattenContracts);
        if (!match) {
            break;
        }
        licences.add(match[1].trim());
    }
    return [...licences];
}
export function normalizeSpdxLicenceIdentifiers(flattenContracts, contractName) {
    const LICENCE_REGEX = /^\s*\/\/\s*SPDX-License-Identifier:(.*)$/mg;
    const uniqueLicences = findUniqueLicences(flattenContracts);
    if (uniqueLicences.length > 1) {
        console.warn(`WARNING contract ${contractName}: multiple licences found: ${uniqueLicences.join(', ')}.
  Solidity compiler does not allow more than one licence. Licence selected: ${uniqueLicences}
    `);
    }
    const firstLicence = LICENCE_REGEX.exec(flattenContracts);
    if (!firstLicence) {
        return flattenContracts;
    }
    const normalizedContract = flattenContracts.replace(LICENCE_REGEX, '');
    return insert(normalizedContract, firstLicence[0], firstLicence.index);
}

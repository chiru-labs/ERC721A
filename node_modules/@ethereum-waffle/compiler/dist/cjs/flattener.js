"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSpdxLicenceIdentifiers = exports.flattenSingleFile = exports.flattenAndSave = exports.flattenProject = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const config_1 = require("./config");
const imports_fs_1 = require("@resolver-engine/imports-fs");
const imports_1 = require("@resolver-engine/imports");
const findInputs_1 = require("./findInputs");
const utils_1 = require("./utils");
async function flattenProject(configPath) {
    await flattenAndSave(await config_1.loadConfig(configPath));
}
exports.flattenProject = flattenProject;
async function flattenAndSave(input) {
    const config = config_1.inputToConfig(input);
    const output = await getContractDependency(config);
    await saveToFile(output, config);
}
exports.flattenAndSave = flattenAndSave;
const getFileName = (rootContract) => path_1.default.parse(rootContract.url).base;
const getFilePath = (fileName, outputDirectory) => path_1.default.join(outputDirectory, fileName);
async function flattenSingleFile(input, name) {
    const config = config_1.inputToConfig(input);
    const output = await getContractDependency(config);
    const contract = output.find((contracts) => getFileName(contracts[contracts.length - 1]) === name);
    if (!contract) {
        return null;
    }
    return getFlattenedSource(contract, '').sourceWithNormalizedLicences;
}
exports.flattenSingleFile = flattenSingleFile;
async function getContractDependency(config) {
    const resolver = imports_fs_1.ImportsFsEngine().addResolver(imports_fs_1.resolvers.BacktrackFsResolver(config.nodeModulesDirectory));
    const allContracts = findInputs_1.findInputs(config.sourceDirectory, utils_1.getExtensionForCompilerType(config));
    return Promise.all(allContracts.map(async (contract) => imports_1.gatherSourcesAndCanonizeImports([contract], '.', resolver)));
}
const fsOps = {
    createDirectory: mkdirp_1.default.sync,
    writeFile: fs_1.default.writeFileSync
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
function normalizeSpdxLicenceIdentifiers(flattenContracts, contractName) {
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
    return utils_1.insert(normalizedContract, firstLicence[0], firstLicence.index);
}
exports.normalizeSpdxLicenceIdentifiers = normalizeSpdxLicenceIdentifiers;

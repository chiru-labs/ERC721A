"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.compileAndSave = exports.compileProject = void 0;
const config_1 = require("./config");
const utils_1 = require("./utils");
const getCompileFunction_1 = require("./getCompileFunction");
const findInputs_1 = require("./findInputs");
const saveOutput_1 = require("./saveOutput");
const imports_fs_1 = require("@resolver-engine/imports-fs");
const imports_1 = require("@resolver-engine/imports");
const generateTypes_1 = require("./generateTypes");
async function compileProject(configPath) {
    const partialConfig = await config_1.loadConfig(configPath);
    await compileAndSave(partialConfig);
    const config = config_1.inputToConfig(partialConfig);
    if (config.typechainEnabled) {
        await generateTypes_1.generateTypes(config);
    }
}
exports.compileProject = compileProject;
async function compileAndSave(input) {
    const config = config_1.inputToConfig(input);
    const output = await compile(config);
    await processOutput(output, config);
}
exports.compileAndSave = compileAndSave;
async function compile(input) {
    return newCompile(config_1.inputToConfig(input));
}
exports.compile = compile;
async function newCompile(config) {
    const resolver = imports_fs_1.ImportsFsEngine().addResolver(
    // Backwards compatibility - change node_modules path
    imports_fs_1.resolvers.BacktrackFsResolver(config.nodeModulesDirectory));
    const sources = await imports_1.gatherSources(findInputs_1.findInputs(config.sourceDirectory, utils_1.getExtensionForCompilerType(config)), '.', resolver);
    return getCompileFunction_1.getCompileFunction(config)(sources);
}
async function processOutput(output, config) {
    if (output.errors) {
        console.error(formatErrors(output.errors));
    }
    if (anyNonWarningErrors(output.errors)) {
        throw new Error('Compilation failed');
    }
    else {
        await saveOutput_1.saveOutput(output, config);
    }
}
function anyNonWarningErrors(errors) {
    return errors && !errors.every(error => error.severity === 'warning');
}
function formatErrors(errors) {
    return errors.map(toFormattedMessage).join('\n');
}
function toFormattedMessage(error) {
    return typeof error === 'string' ? error : error.formattedMessage;
}

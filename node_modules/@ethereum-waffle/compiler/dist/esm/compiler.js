import { inputToConfig, loadConfig } from './config';
import { getExtensionForCompilerType } from './utils';
import { getCompileFunction } from './getCompileFunction';
import { findInputs } from './findInputs';
import { saveOutput } from './saveOutput';
import { ImportsFsEngine, resolvers } from '@resolver-engine/imports-fs';
import { gatherSources } from '@resolver-engine/imports';
import { generateTypes } from './generateTypes';
export async function compileProject(configPath) {
    const partialConfig = await loadConfig(configPath);
    await compileAndSave(partialConfig);
    const config = inputToConfig(partialConfig);
    if (config.typechainEnabled) {
        await generateTypes(config);
    }
}
export async function compileAndSave(input) {
    const config = inputToConfig(input);
    const output = await compile(config);
    await processOutput(output, config);
}
export async function compile(input) {
    return newCompile(inputToConfig(input));
}
async function newCompile(config) {
    const resolver = ImportsFsEngine().addResolver(
    // Backwards compatibility - change node_modules path
    resolvers.BacktrackFsResolver(config.nodeModulesDirectory));
    const sources = await gatherSources(findInputs(config.sourceDirectory, getExtensionForCompilerType(config)), '.', resolver);
    return getCompileFunction(config)(sources);
}
async function processOutput(output, config) {
    if (output.errors) {
        console.error(formatErrors(output.errors));
    }
    if (anyNonWarningErrors(output.errors)) {
        throw new Error('Compilation failed');
    }
    else {
        await saveOutput(output, config);
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

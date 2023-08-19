"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    sourceDirectory: './contracts',
    outputDirectory: './build',
    flattenOutputDirectory: './flatten',
    nodeModulesDirectory: './node_modules',
    cacheDirectory: './cache',
    compilerType: 'solcjs',
    compilerVersion: 'default',
    compilerAllowedPaths: [],
    compilerOptions: {},
    outputHumanReadableAbi: false,
    outputType: 'multiple',
    typechainEnabled: false,
    typechainOutputDir: 'types'
};

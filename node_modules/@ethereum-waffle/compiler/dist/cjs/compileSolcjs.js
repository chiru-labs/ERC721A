"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCompiler = exports.compileSolcjs = void 0;
const solc_1 = __importDefault(require("solc"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("./utils");
const compilerInput_1 = require("./compilerInput");
const findImports_1 = require("./findImports");
const mkdirp_1 = __importDefault(require("mkdirp"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const semverRegex = /^\d+\.\d+\.\d+$/;
function compileSolcjs(config) {
    return async function compile(sources) {
        const solc = await loadCompiler(config);
        const input = compilerInput_1.getCompilerInput(sources, config.compilerOptions, 'Solidity');
        const imports = findImports_1.findImports(sources);
        const output = solc.compile(input, { imports });
        return JSON.parse(output);
    };
}
exports.compileSolcjs = compileSolcjs;
async function loadCompiler({ compilerVersion, cacheDirectory }) {
    if (isDefaultVersion(compilerVersion)) {
        return solc_1.default;
    }
    if (utils_1.isDirectory(compilerVersion)) {
        return require(path_1.default.resolve(compilerVersion));
    }
    try {
        const version = semverRegex.test(compilerVersion)
            ? await resolveSemverVersion(compilerVersion)
            : compilerVersion;
        return await loadVersion(version, cacheDirectory);
    }
    catch (e) {
        throw new Error(`Error fetching compiler version: ${compilerVersion}.`);
    }
}
exports.loadCompiler = loadCompiler;
function isDefaultVersion(version) {
    return version === 'default' ||
        (semverRegex.test(version) && solc_1.default.version().startsWith(`${version}+`));
}
async function resolveSemverVersion(version) {
    const releases = await fetchReleases();
    const item = releases[version];
    return item.substring('soljson-'.length, item.length - '.js'.length);
}
const VERSION_LIST_URL = 'https://solc-bin.ethereum.org/bin/list.json';
let cache = undefined;
async function fetchReleases() {
    if (!cache) {
        const res = await node_fetch_1.default(VERSION_LIST_URL);
        const { releases } = await res.json();
        cache = releases;
    }
    return cache;
}
async function loadVersion(version, cacheDirectory) {
    const cachedSolcPath = path_1.default.resolve(cacheDirectory, 'solcjs', `${version}.js`);
    if (!utils_1.isFile(cachedSolcPath)) {
        await cacheRemoteVersion(version, cacheDirectory);
    }
    return loadCachedVersion(cachedSolcPath);
}
async function cacheRemoteVersion(version, cacheDirectory) {
    const solcCacheDirectory = path_1.default.resolve(cacheDirectory, 'solcjs');
    if (!utils_1.isDirectory(solcCacheDirectory)) {
        mkdirp_1.default.sync(solcCacheDirectory);
    }
    const filePath = path_1.default.join(solcCacheDirectory, `${version}.js`);
    const file = fs_1.default.createWriteStream(filePath);
    const url = `https://solc-bin.ethereum.org/bin/soljson-${version}.js`;
    await new Promise((resolve, reject) => {
        https_1.default.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (error) => {
            try {
                fs_1.default.unlinkSync(filePath);
                utils_1.removeEmptyDirsRecursively(path_1.default.resolve(cacheDirectory));
            }
            finally {
                reject(error);
            }
        });
    });
}
function loadCachedVersion(cachedVersionPath) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const solcjs = require(cachedVersionPath);
    return solc_1.default.setupMethods(solcjs);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeChain = void 0;
const ts_generator_1 = require("ts-generator");
const _ = require("lodash");
const lodash_1 = require("lodash");
const debug_1 = require("./utils/debug");
const path_1 = require("path");
/**
 * Proxies calls to real implementation that is selected based on target parameter.
 */
class TypeChain extends ts_generator_1.TsGeneratorPlugin {
    constructor(ctx) {
        super(ctx);
        this.name = 'TypeChain';
        this.realImpl = this.findRealImpl(ctx);
    }
    findRealImpl(ctx) {
        const target = ctx.rawConfig.target;
        if (!target) {
            throw new Error(`Please provide --target parameter!`);
        }
        const possiblePaths = [
            process.env.NODE_ENV === 'test' && `../../typechain-target-${target}/lib/index`,
            `typechain-target-${target}`,
            `@typechain/${target}`,
            ensureAbsPath(target),
        ];
        const moduleInfo = _(possiblePaths).compact().map(tryRequire).compact().first();
        if (!moduleInfo || !moduleInfo.module.default) {
            throw new Error(`Couldn't find ${ctx.rawConfig.target}. Tried loading: ${lodash_1.compact(possiblePaths).join(', ')}.\nPerhaps you forgot to install typechain-target-${target}?`);
        }
        debug_1.debug('Plugin found at', moduleInfo.path);
        return new moduleInfo.module.default(ctx);
    }
    beforeRun() {
        return this.realImpl.beforeRun();
    }
    transformFile(file) {
        return this.realImpl.transformFile(file);
    }
    afterRun() {
        return this.realImpl.afterRun();
    }
}
exports.TypeChain = TypeChain;
function tryRequire(name) {
    try {
        const module = {
            module: require(name),
            name,
            path: require.resolve(name),
        };
        debug_1.debug('Load successfully: ', name);
        return module;
    }
    catch (e) {
        debug_1.debug("Couldn't load: ", name);
    }
}
function ensureAbsPath(path) {
    if (path_1.isAbsolute(path)) {
        return path;
    }
    return path_1.join(process.cwd(), path);
}
//# sourceMappingURL=TypeChain.js.map
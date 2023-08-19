"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolvePlugin_1 = require("./resolvePlugin");
function loadPlugin(deps, ctx) {
    const pluginPath = resolvePlugin_1.resolvePlugin(deps, ctx.rawConfig.generator, ctx.cwd);
    const PluginModule = require(pluginPath);
    const moduleExportsCount = Object.keys(PluginModule).length;
    if (moduleExportsCount !== 1) {
        throw new Error(`Loading plugin ${ctx.rawConfig.generator} failed. Plugin module has to export exactly one entity. Found ${moduleExportsCount} instead`);
    }
    const PluginCtr = getFirstKey(PluginModule);
    return new PluginCtr(ctx);
}
exports.loadPlugin = loadPlugin;
function getFirstKey(object) {
    for (const k of Object.keys(object)) {
        return object[k];
    }
    throw new Error("Any key missing!");
}
exports.getFirstKey = getFirstKey;

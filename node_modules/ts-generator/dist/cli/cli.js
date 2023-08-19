#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const tsGenerator_1 = require("../tsGenerator");
const deps_1 = require("../deps");
const parseConfigFile_1 = require("../parseConfigFile");
const loadPlugin_1 = require("../plugins/loadPlugin");
async function cli(configPathRel, customDeps) {
    const configPath = path_1.join(process.cwd(), configPathRel);
    const cwd = path_1.dirname(configPath);
    const deps = Object.assign({}, deps_1.createDeps(), customDeps);
    const cfg = await parseConfigFile_1.parseConfigFile(deps, { configPath, cwd });
    const plugins = cfg.plugins.map((pluginCfg) => loadPlugin_1.loadPlugin(deps, { cwd: cfg.cwd, rawConfig: pluginCfg, logger: deps.logger.childLogger(pluginCfg.generator) }));
    await tsGenerator_1.tsGenerator(cfg, plugins, deps);
}
exports.cli = cli;

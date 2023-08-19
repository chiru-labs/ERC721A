"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function parseConfigFile({ fs, prettier, logger }, { cwd, configPath }) {
    const config = fs.readFileSync(configPath, "utf-8");
    // assume that config is correctly formatted JUST FOR NOW
    const pluginCfg = JSON.parse(config);
    const prettierCfg = await prettier.resolveConfig(cwd);
    if (prettierCfg) {
        logger.info("Using custom prettier config.");
    }
    else {
        logger.info("Using default prettier config.");
    }
    return {
        cwd,
        loggingLvl: "info",
        prettier: prettierCfg,
        plugins: pluginCfg,
    };
}
exports.parseConfigFile = parseConfigFile;

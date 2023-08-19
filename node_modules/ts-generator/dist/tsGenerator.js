"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const deps_1 = require("./deps");
const util_1 = require("util");
const path_1 = require("path");
const outputTransformers_1 = require("./outputTransformers");
const stats = {
    filesGenerated: 0,
};
async function tsGenerator(cfg, plugins_, deps_) {
    const deps = deps_ || deps_1.createDeps();
    const plugins = util_1.isArray(plugins_) ? plugins_ : [plugins_];
    const { cwd } = cfg;
    const { fs, logger } = deps;
    logger.lvl = cfg.loggingLvl || "error";
    for (const plugin of plugins) {
        logger.info(`Running ${plugin.name}`);
        logger.verbose("Running before hook for", logger.accent(plugin.name));
        processOutput(deps, cfg, await plugin.beforeRun());
        const filePaths = glob.sync(plugin.ctx.rawConfig.files, { ignore: "node_modules/**", absolute: true, cwd });
        logger.info(`${plugin.ctx.rawConfig.files} matched ${filePaths.length} files.`);
        const fileDescs = filePaths.map((path) => ({
            path,
            contents: fs.readFileSync(path, "utf8"),
        }));
        for (const fd of fileDescs) {
            logger.info(`Processing ${logger.accent(path_1.relative(cwd, fd.path))}`);
            processOutput(deps, cfg, await plugin.transformFile(fd));
        }
        logger.verbose("Running after hook for", logger.accent(plugin.name));
        processOutput(deps, cfg, await plugin.afterRun());
    }
    logger.info(`💎 All done! Generated files: ${stats.filesGenerated}`);
}
exports.tsGenerator = tsGenerator;
function processOutput(deps, cfg, output) {
    const { fs, logger, mkdirp } = deps;
    if (!output) {
        return;
    }
    const outputFds = util_1.isArray(output) ? output : [output];
    outputFds.forEach((fd) => {
        // ensure directory first
        mkdirp(path_1.dirname(fd.path));
        const finalOutput = outputTransformers_1.outputTransformers.reduce((content, transformer) => transformer(content, deps, cfg), fd.contents);
        logger.info(`Writing file: ${logger.accent(path_1.relative(cfg.cwd, fd.path))}`);
        stats.filesGenerated++;
        fs.writeFileSync(fd.path, finalOutput, "utf8");
    });
}
exports.processOutput = processOutput;

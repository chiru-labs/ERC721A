const API = require('./../lib/api');
const utils = require('./resources/plugin.utils');
const buidlerUtils = require('./resources/nomiclabs.utils');
const PluginUI = require('./resources/nomiclabs.ui');

const pkg = require('./../package.json');
const death = require('death');
const path = require('path');

const { task, types } = require("@nomiclabs/buidler/config");
const { ensurePluginLoadedWithUsePlugin } = require("@nomiclabs/buidler/plugins");

const {
  TASK_TEST,
  TASK_COMPILE,
  TASK_COMPILE_GET_COMPILER_INPUT
} = require("@nomiclabs/buidler/builtin-tasks/task-names");

ensurePluginLoadedWithUsePlugin();

function plugin() {

  // UI for the task flags...
  const ui = new PluginUI();

  // Unset useLiteralContent due to solc metadata size restriction
  task(TASK_COMPILE_GET_COMPILER_INPUT).setAction(async (_, __, runSuper) => {
    const input = await runSuper();
    input.settings.metadata.useLiteralContent = false;
    return input;
  })

  task("coverage", "Generates a code coverage report for tests")

    .addOptionalParam("testfiles",  ui.flags.file,       "", types.string)
    .addOptionalParam("solcoverjs", ui.flags.solcoverjs, "", types.string)
    .addOptionalParam('temp',       ui.flags.temp,       "", types.string)

    .setAction(async function(args, env){
      let error;
      let ui;
      let api;
      let config;

      try {
        death(buidlerUtils.finish.bind(null, config, api)); // Catch interrupt signals

        config = buidlerUtils.normalizeConfig(env.config, args);
        ui = new PluginUI(config.logger.log);
        api = new API(utils.loadSolcoverJS(config));

        // ==============
        // Server launch
        // ==============
        const network = buidlerUtils.setupBuidlerNetwork(env, api, ui);

        const client = api.client || require('ganache-cli');
        const address = await api.ganache(client);
        const accountsRequest = await utils.getAccountsGanache(api.server.provider);
        const nodeInfoRequest = await utils.getNodeInfoGanache(api.server.provider);
        const ganacheVersion = nodeInfoRequest.result.split('/')[1];

        // Set default account
        network.from = accountsRequest.result[0];

        // Version Info
        ui.report('versions', [
          ganacheVersion,
          pkg.version
        ]);

        ui.report('ganache-network', [
          env.network.name,
          api.port
        ]);

        // Run post-launch server hook;
        await api.onServerReady(config);

        // ================
        // Instrumentation
        // ================

        const skipFiles = api.skipFiles || [];

        let {
          targets,
          skipped
        } = utils.assembleFiles(config, skipFiles);

        targets = api.instrument(targets);
        utils.reportSkipped(config, skipped);

        // ==============
        // Compilation
        // ==============
        config.temp = args.temp;

        const {
          tempArtifactsDir,
          tempContractsDir
        } = utils.getTempLocations(config);

        utils.setupTempFolders(config, tempContractsDir, tempArtifactsDir)
        utils.save(targets, config.paths.sources, tempContractsDir);
        utils.save(skipped, config.paths.sources, tempContractsDir);

        config.paths.sources = tempContractsDir;
        config.paths.artifacts = tempArtifactsDir;
        config.paths.cache = buidlerUtils.tempCacheDir(config);
        config.solc.optimizer.enabled = false;

        await env.run(TASK_COMPILE);

        await api.onCompileComplete(config);

        // ======
        // Tests
        // ======
        const testfiles = args.testfiles
          ? buidlerUtils.getTestFilePaths(args.testfiles)
          : [];

        try {
          await env.run(TASK_TEST, {testFiles: testfiles})
        } catch (e) {
          error = e;
        }
        await api.onTestsComplete(config);

        // ========
        // Istanbul
        // ========
        await api.report();
        await api.onIstanbulComplete(config);

    } catch(e) {
       error = e;
    }

    await buidlerUtils.finish(config, api);

    if (error !== undefined ) throw error;
    if (process.exitCode > 0) throw new Error(ui.generate('tests-fail', [process.exitCode]));
  })
}

module.exports = plugin;

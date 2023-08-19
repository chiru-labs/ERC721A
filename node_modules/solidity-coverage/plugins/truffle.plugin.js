const API = require('./../lib/api');
const utils = require('./resources/plugin.utils');
const truffleUtils = require('./resources/truffle.utils');
const PluginUI = require('./resources/truffle.ui');
const pkg = require('./../package.json');
const death = require('death');
const path = require('path');

/**
 * Truffle Plugin: `truffle run coverage [options]`
 * @param  {Object}   config   @truffle/config config
 * @return {Promise}
 */
async function plugin(config){
  let ui;
  let api;
  let error;
  let truffle;
  let testsErrored = false;

  try {
    death(utils.finish.bind(null, config, api)); // Catch interrupt signals

    config = truffleUtils.normalizeConfig(config);

    ui = new PluginUI(config.logger.log);

    if(config.help) return ui.report('help');    // Exit if --help

    truffle = truffleUtils.loadLibrary(config);
    api = new API(utils.loadSolcoverJS(config));

    truffleUtils.setNetwork(config, api);

    // Server launch
    const client = api.client || truffle.ganache;
    const address = await api.ganache(client);
    const accountsRequest = await utils.getAccountsGanache(api.server.provider);
    const nodeInfoRequest = await utils.getNodeInfoGanache(api.server.provider);
    const ganacheVersion = nodeInfoRequest.result.split('/')[1];

    truffleUtils.setNetworkFrom(config, accountsRequest.result);

    // Version Info
    ui.report('versions', [
      truffle.version,
      ganacheVersion,
      pkg.version
    ]);

    // Exit if --version
    if (config.version) return await utils.finish(config, api);

    ui.report('network', [
      config.network,
      config.networks[config.network].network_id,
      config.networks[config.network].port
    ]);

    // Run post-launch server hook;
    await api.onServerReady(config);

    // Instrument
    const skipFiles = api.skipFiles || [];
    skipFiles.push('Migrations.sol');

    let {
      targets,
      skipped
    } = utils.assembleFiles(config, skipFiles);

    targets = api.instrument(targets);
    utils.reportSkipped(config, skipped);

    // Filesystem & Compiler Re-configuration
    const {
      tempArtifactsDir,
      tempContractsDir
    } = utils.getTempLocations(config);

    utils.setupTempFolders(config, tempContractsDir, tempArtifactsDir)
    utils.save(targets, config.contracts_directory, tempContractsDir);
    utils.save(skipped, config.contracts_directory, tempContractsDir);

    config.contracts_directory = tempContractsDir;
    config.build_directory = tempArtifactsDir;

    config.contracts_build_directory = path.join(
      tempArtifactsDir,
      path.basename(config.contracts_build_directory)
    );

    config.all = true;
    config.compilers.solc.settings.optimizer.enabled = false;

    // Run pre-compile hook;
    await api.onPreCompile(config);

    // Compile Instrumented Contracts
    await truffle.contracts.compile(config);
    await api.onCompileComplete(config);

    config.test_files = await truffleUtils.getTestFilePaths(config);
    // Run tests
    try {
      failures = await truffle.test.run(config)
    } catch (e) {
      error = e.stack;
    }
    await api.onTestsComplete(config);

    // Run Istanbul
    await api.report();
    await api.onIstanbulComplete(config);

  } catch(e){
    error = e;
  }

  // Finish
  await utils.finish(config, api);

  if (error !== undefined) throw error;
  if (failures > 0) throw new Error(ui.generate('tests-fail', [failures]));
}

module.exports = plugin;

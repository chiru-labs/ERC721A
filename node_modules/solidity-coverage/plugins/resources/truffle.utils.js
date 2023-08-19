const PluginUI = require('./truffle.ui');
const globalModules = require('global-modules');
const TruffleProvider = require('@truffle/provider');
const recursive = require('recursive-readdir');
const globby = require('globby');
const path = require('path');

// =============================
// Truffle Specific Plugin Utils
// ==============================

/**
 * Returns a list of test files to pass to mocha.
 * @param  {Object}   config  truffleConfig
 * @return {String[]}         list of files to pass to mocha
 */
async function getTestFilePaths(config){
  let target;
  let ui = new PluginUI(config.logger.log);


  // Handle --file <path|glob> cli option (subset of tests)
  (typeof config.file === 'string')
    ? target = globby.sync([config.file])
    : target = await recursive(config.testDir);

  // Filter native solidity tests and warn that they're skipped
  const solregex = /.*\.(sol)$/;
  const hasSols = target.filter(f => f.match(solregex) != null);

  if (hasSols.length > 0) ui.report('sol-tests', [hasSols.length]);

  // Return list of test files
  const testregex = /.*\.(js|ts|es|es6|jsx)$/;
  return target.filter(f => f.match(testregex) != null);
}


/**
 * Configures the network. Runs before the server is launched.
 * User can request a network from truffle-config with "--network <name>".
 * There are overlapiing options in solcoverjs (like port and providerOptions.network_id).
 * Where there are mismatches user is warned & the truffle network settings are preferred.
 *
 * Also generates a default config & sets the default gas high / gas price low.
 *
 * @param {TruffleConfig}      config
 * @param {SolidityCoverage} api
 */
function setNetwork(config, api){
  const ui = new PluginUI(config.logger.log);

  // --network <network-name>
  if (config.network){
    const network = config.networks[config.network];

    // Check network:
    if (!network){
      throw new Error(ui.generate('no-network', [config.network]));
    }

    // Check network id
    if (!isNaN(parseInt(network.network_id))){

      // Warn: non-matching provider options id and network id
      if (api.providerOptions.network_id &&
          api.providerOptions.network_id !== parseInt(network.network_id)){

        ui.report('id-clash', [ parseInt(network.network_id) ]);
      }

      // Prefer network defined id.
      api.providerOptions.network_id = parseInt(network.network_id);

    } else {
      network.network_id = "*";
    }

    // Check port: use solcoverjs || default if undefined
    if (!network.port) {
      ui.report('no-port', [api.port]);
      network.port = api.port;
    }

    // Warn: port conflicts
    if (api.port !== api.defaultPort && api.port !== network.port){
      ui.report('port-clash', [ network.port ])
    }

    // Prefer network port if defined;
    api.port = network.port;

    network.gas = api.gasLimit;
    network.gasPrice = api.gasPrice;

    setOuterConfigKeys(config, api, network.network_id);
    return;
  }

  // Default Network Configuration
  config.network = 'soliditycoverage';
  setOuterConfigKeys(config, api, "*");

  config.networks[config.network] = {
    network_id: "*",
    port: api.port,
    host: api.host,
    gas: api.gasLimit,
    gasPrice: api.gasPrice
  }
}

/**
 * Sets the default `from` account field in the truffle network that will be used.
 * This needs to be done after accounts are fetched from the launched client.
 * @param {TruffleConfig} config
 * @param {Array}         accounts
 */
function setNetworkFrom(config, accounts){
  if (!config.networks[config.network].from){
    config.networks[config.network].from = accounts[0];
  }
}

// Truffle complains that these outer keys *are not* set when running plugin fn directly.
// But throws saying they *cannot* be manually set when running as truffle command.
function setOuterConfigKeys(config, api, id){
  try {
    config.network_id = id;
    config.port = api.port;
    config.host = api.host;
    config.provider = TruffleProvider.create(config);
  } catch (err){}
}

/**
 * Tries to load truffle module library and reports source. User can force use of
 * a non-local version using cli flags (see option). Load order is:
 *
 * 1. local node_modules
 * 2. global node_modules
 *
 * @param  {Object} truffleConfig config
 * @return {Module}
 */
function loadLibrary(config){
  const ui = new PluginUI(config.logger.log);

  // Local
  try {
    if (config.useGlobalTruffle) throw null;

    const lib = require("truffle");
    ui.report('lib-local');
    return lib;

  } catch(err) {};

  // Global
  try {
    if (config.forceLibFailure) throw null; // For err unit testing

    const globalTruffle = path.join(globalModules, 'truffle');
    const lib = require(globalTruffle);
    ui.report('lib-global');
    return lib;

  } catch(err) {
    throw new Error(ui.generate('lib-fail', [err]));
  };
}

/**
 * Maps truffle specific keys for the paths to things like sources to the generic
 * keys required by the plugin utils
 * @return {Object} truffle-config.js
 */
function normalizeConfig(config){
  config.workingDir = config.working_directory;
  config.contractsDir = config.contracts_directory;
  config.testDir = config.test_directory;
  config.artifactsDir = config.build_directory;

  // eth-gas-reporter freezes the in-process client because it uses sync calls
  if (typeof config.mocha === "object" && config.mocha.reporter === 'eth-gas-reporter'){
    config.mocha.reporter = 'spec';
    delete config.mocha.reporterOptions;
  }

  // Truffle V4 style solc settings are honored over V5 settings. Apparently it's common
  // for both to be present in the same config (as an error).
  if (typeof config.solc === "object" ){
    config.solc.optimizer = { enabled: false };
  }

  return config;
}

module.exports = {
  getTestFilePaths,
  setNetwork,
  setNetworkFrom,
  loadLibrary,
  normalizeConfig,
}

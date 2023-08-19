/* global web3 */

let singletonsConfig;

function setSingletonsConfig (config) {
  singletonsConfig = config;
}

function setDefaultSingletonsConfig () {
  setSingletonsConfig({
    abstraction: isTruffleEnvironment() ? 'truffle' : 'web3',
    defaultGas: 200e3,
    defaultSender: '',
  });
}

function getSingletonsConfig () {
  return singletonsConfig;
}

function isTruffleEnvironment () {
  // Truffle environments are detected by the presence of (truffle-injected) global web3 and artifacts variables
  return (typeof web3 !== 'undefined' && typeof artifacts !== 'undefined');
}

setSingletonsConfig.default = setDefaultSingletonsConfig;

module.exports = {
  setSingletonsConfig,
  getSingletonsConfig,
};

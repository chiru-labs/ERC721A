/* global web3 */

const Web3 = require('web3');

const DEFAULT_PROVIDER_URL = 'http://localhost:8545';

const localWeb3 = new Web3();

function setWeb3Provider (provider) {
  localWeb3.setProvider(provider);
}

function setDefaultWeb3Provider () {
  // If there is a (truffle-injected) global web3 instance, use that. Otherwise, use the default provider
  if (typeof web3 !== 'undefined') {
    setWeb3Provider(web3.currentProvider);
  } else {
    setWeb3Provider(DEFAULT_PROVIDER_URL);
  }
}

function getWeb3 () {
  if (localWeb3.currentProvider === null) {
    throw new Error('web3 provider is not configured');
  }

  return localWeb3;
}

setWeb3Provider.default = setDefaultWeb3Provider;

module.exports = {
  setWeb3Provider,
  getWeb3,
};

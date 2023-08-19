const { toWei } = require('web3-utils');
const { BN } = require('./setup');

function ether (n) {
  return new BN(toWei(n, 'ether'));
}

module.exports = ether;

require('../configure')();

const web3 = require('./config/web3').getWeb3();

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);

require('chai').use(chaiBN);

// Installing chai-bn for the user is part of the offering.
//
// The chai module used internally by us may not be the same one that the user
// has in their own tests. This can happen if the version ranges required don't
// intersect, or if the package manager doesn't dedupe the modules for any
// other reason. We do our best to install chai-bn for the user.
for (const mod of [require.main, module.parent]) {
  try {
    mod.require('chai').use(chaiBN);
  } catch (e) {
    // Ignore errors
  }
}

module.exports = {
  web3,
  BN,
};

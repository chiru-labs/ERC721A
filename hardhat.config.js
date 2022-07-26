require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');

if (process.env.REPORT_GAS) {
  require('hardhat-gas-reporter');
}

if (process.env.REPORT_COVERAGE) {
  require('solidity-coverage');
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.11',
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 100,
    showTimeSpent: true,
  },
  plugins: ['solidity-coverage'],
};

// The "ripemd160" algorithm is not available anymore in NodeJS 17+ (because of lib SSL 3).
// The following code replaces it with "sha256" instead.

const crypto = require('crypto');

try {
  crypto.createHash('ripemd160');
} catch (e) {
  const origCreateHash = crypto.createHash;
  crypto.createHash = (alg, opts) => {
    return origCreateHash(alg === 'ripemd160' ? 'sha256' : alg, opts);
  };
}

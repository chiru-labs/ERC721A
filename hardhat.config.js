require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');

if (process.env.REPORT_GAS) {
  require("hardhat-gas-reporter");
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  gasReporter: {
    currency: 'USD',
  }
};

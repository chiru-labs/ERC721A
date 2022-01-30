require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-gas-reporter');
require('dotenv').config();
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
    enabled: process.env.REPORT_GAS,
    coinmarketcap: process.env.COINMARKETCAP_KEY || '',
    currency: 'USD',
    gasPrice: 100,
    showTimeSpent: true,
  },
};

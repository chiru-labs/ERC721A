require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('hardhat-gas-reporter');
require('dotenv').config();
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.11',
  gasReporter: {
    enabled: process.env.REPORT_GAS,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_KEY || '',
  },
};

# 1.0.6 / 2021-11-29
  * Add missing config TS types for multi chain gas prices (https://github.com/cgewecke/hardhat-gas-reporter/issues/81)

# 1.0.5 / 2021-11-29
  * Fix remote data fetching race condition (https://github.com/cgewecke/hardhat-gas-reporter/issues/80)
  * Update eth-gas-reporter to 0.2.23 (https://github.com/cgewecke/hardhat-gas-reporter/issues/80)
  * Add gas reporter merge task (https://github.com/cgewecke/hardhat-gas-reporter/issues/75)
  * Bump y18n from 3.2.1 to 3.2.2 (https://github.com/cgewecke/hardhat-gas-reporter/issues/61)
  * Bump hosted-git-info from 2.8.8 to 2.8.9 (https://github.com/cgewecke/hardhat-gas-reporter/issues/64)
  * Bump normalize-url from 4.5.0 to 4.5.1 (https://github.com/cgewecke/hardhat-gas-reporter/issues/66)
  * Bump glob-parent from 5.1.1 to 5.1.2 (https://github.com/cgewecke/hardhat-gas-reporter/issues/67)
  * Bump tar from 4.4.13 to 4.4.15 (https://github.com/cgewecke/hardhat-gas-reporter/issues/70)
  * Bump path-parse from 1.0.6 to 1.0.7 (https://github.com/cgewecke/hardhat-gas-reporter/issues/71)
    dependabot

# 1.0.4 / 2020-12-21
  * Fix bug that caused txs signed with Waffle wallets to be omitted from report (https://github.com/cgewecke/hardhat-gas-reporter/issues/54)

# 1.0.3 / 2020-12-02
  * Fix excludeContracts option & support folders (https://github.com/cgewecke/hardhat-gas-reporter/issues/51)

# 1.0.2 / 2020-12-01
  * Add remoteContracts option (https://github.com/cgewecke/hardhat-gas-reporter/issues/49)
  * Fix null receipt crash (https://github.com/cgewecke/hardhat-gas-reporter/issues/48)

# 1.0.1 / 2020-11-09
  * Make all EthGasReporterConfig types optional (https://github.com/cgewecke/hardhat-gas-reporter/issues/45)
  * Fix test return value bug by returning result of runSuper (https://github.com/cgewecke/hardhat-gas-reporter/issues/44)

# 1.0.0 / 2020-10-29
  * Refactor as hardhat-gas-reporter (https://github.com/cgewecke/hardhat-gas-reporter/issues/38)
  * Update eth-gas-reporter to 0.2.19

# 0.1.4 / 2020-10-13
  * Add coinmarketcap to types
  * Support in-process BuidlerEVM / remove "independent node" requirement

# 0.1.3 / 2019-12-01
  * Upgrade artifacts handler for Buidler 1.x, fixing missing deployment data

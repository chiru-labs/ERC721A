const { ethers } = require("hardhat");

const deployContract = async function (contractName, constructorArgs) {
  let factory;
  try {
    factory = await ethers.getContractFactory(contractName);
  } catch (e) {
    factory = await ethers.getContractFactory(contractName + 'UpgradeableWithInit');
  }
  let contract = await factory.deploy(...(constructorArgs || []));
  await contract.deployed();
  return contract;
};

const getBlockTimestamp = async function () {
  return parseInt((await ethers.provider.getBlock('latest'))['timestamp']);
};

const mineBlockTimestamp = async function (timestamp) {
  await ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);
  await ethers.provider.send('evm_mine');
};

module.exports = { deployContract, getBlockTimestamp, mineBlockTimestamp };
const { ethers } = require('hardhat');
const { BigNumber } = require('ethers');

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

const offsettedIndex = function (startTokenId, arr) {
  // return one item if arr length is 1
  if (arr.length === 1) {
    return BigNumber.from(startTokenId + arr[0]);
  }
  return arr.map((num) => BigNumber.from(startTokenId + num));
};

module.exports = { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex };

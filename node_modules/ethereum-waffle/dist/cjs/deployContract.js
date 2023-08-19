"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployContract = void 0;
const ethers_1 = require("ethers");
const ContractJSON_1 = require("./ContractJSON");
async function deployContract(wallet, factoryOrContractJson, args = [], overrideOptions = {}) {
    if ('abi' in factoryOrContractJson) {
        return deployFromJson(wallet, factoryOrContractJson, args, overrideOptions);
    }
    else {
        const Factory = factoryOrContractJson;
        const contractFactory = new Factory(wallet);
        const contract = await contractFactory.deploy(...args, overrideOptions);
        await contract.deployed();
        return contract;
    }
}
exports.deployContract = deployContract;
async function deployFromJson(wallet, contractJson, args, overrideOptions) {
    const bytecode = ContractJSON_1.isStandard(contractJson) ? contractJson.evm.bytecode : contractJson.bytecode;
    if (!ContractJSON_1.hasByteCode(bytecode)) {
        throw new Error('Cannot deploy contract with empty bytecode');
    }
    const factory = new ethers_1.ContractFactory(contractJson.abi, bytecode, wallet);
    const contract = await factory.deploy(...args, {
        ...overrideOptions
    });
    await contract.deployed();
    return contract;
}

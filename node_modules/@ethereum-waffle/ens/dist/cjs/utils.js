"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainInfo = exports.deployContract = exports.COIN_TYPE_ETH = void 0;
const ethers_1 = require("ethers");
const errors_1 = require("./errors");
const { namehash } = ethers_1.utils;
exports.COIN_TYPE_ETH = 60;
const deployContract = async (signer, contractJSON, args) => {
    const factory = new ethers_1.ContractFactory(contractJSON.abi, contractJSON.bytecode, signer);
    return factory.deploy(...args);
};
exports.deployContract = deployContract;
const getDomainInfo = (domain) => {
    const chunks = domain.split('.');
    const isTopLevelDomain = (chunks.length === 1 && chunks[0].length > 0);
    const isEmptyDomain = (domain === '');
    if (isTopLevelDomain) {
        throw new errors_1.ExpectedTopLevelDomain();
    }
    else if (isEmptyDomain) {
        throw new errors_1.InvalidDomain(domain);
    }
    try {
        namehash(domain);
    }
    catch (e) {
        throw new errors_1.InvalidDomain(domain);
    }
    return {
        chunks,
        tld: chunks[chunks.length - 1],
        rawLabel: chunks[0],
        label: ethers_1.utils.id(chunks[0]),
        node: namehash(domain),
        rootNode: namehash(domain.replace(chunks[0] + '.', '')),
        decodedRootNode: domain.replace(chunks[0] + '.', '')
    };
};
exports.getDomainInfo = getDomainInfo;

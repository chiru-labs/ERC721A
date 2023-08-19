import { ContractFactory, utils } from 'ethers';
import { ExpectedTopLevelDomain, InvalidDomain } from './errors';
const { namehash } = utils;
export const COIN_TYPE_ETH = 60;
export const deployContract = async (signer, contractJSON, args) => {
    const factory = new ContractFactory(contractJSON.abi, contractJSON.bytecode, signer);
    return factory.deploy(...args);
};
export const getDomainInfo = (domain) => {
    const chunks = domain.split('.');
    const isTopLevelDomain = (chunks.length === 1 && chunks[0].length > 0);
    const isEmptyDomain = (domain === '');
    if (isTopLevelDomain) {
        throw new ExpectedTopLevelDomain();
    }
    else if (isEmptyDomain) {
        throw new InvalidDomain(domain);
    }
    try {
        namehash(domain);
    }
    catch (e) {
        throw new InvalidDomain(domain);
    }
    return {
        chunks,
        tld: chunks[chunks.length - 1],
        rawLabel: chunks[0],
        label: utils.id(chunks[0]),
        node: namehash(domain),
        rootNode: namehash(domain.replace(chunks[0] + '.', '')),
        decodedRootNode: domain.replace(chunks[0] + '.', '')
    };
};

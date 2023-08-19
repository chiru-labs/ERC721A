"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENS = exports.deployENS = exports.createReverseRegistrar = exports.createResolver = void 0;
const ens_1 = require("@ensdomains/ens");
const resolver_1 = require("@ensdomains/resolver");
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
const { namehash } = ethers_1.utils;
const { HashZero } = ethers_1.constants;
async function createResolver(signer, ens) {
    const resolver = await utils_1.deployContract(signer, resolver_1.PublicResolver, [ens.address]);
    const resolverNode = namehash('resolver');
    const resolverLabel = ethers_1.utils.id('resolver');
    await ens.setSubnodeOwner(HashZero, resolverLabel, await signer.getAddress());
    await ens.setResolver(resolverNode, resolver.address);
    await resolver['setAddr(bytes32,uint256,bytes)'](resolverNode, utils_1.COIN_TYPE_ETH, resolver.address);
    return resolver;
}
exports.createResolver = createResolver;
async function createReverseRegistrar(signer, ens, resolver) {
    const reverseRegistrar = await utils_1.deployContract(signer, ens_1.ReverseRegistrar, [ens.address, resolver.address]);
    await ens.setSubnodeOwner(HashZero, ethers_1.utils.id('reverse'), await signer.getAddress());
    await ens.setSubnodeOwner(namehash('reverse'), ethers_1.utils.id('addr'), reverseRegistrar.address);
    return reverseRegistrar;
}
exports.createReverseRegistrar = createReverseRegistrar;
async function deployENS(signer) {
    const ens = await utils_1.deployContract(signer, ens_1.ENSRegistry, []);
    const resolver = await createResolver(signer, ens);
    const reverseRegistrar = await createReverseRegistrar(signer, ens, resolver);
    return new ENS(signer, ens, resolver, reverseRegistrar);
}
exports.deployENS = deployENS;
class ENS {
    constructor(signer, ens, resolver, reverseRegistrar) {
        this.registrars = {};
        this.signer = signer;
        this.ens = ens;
        this.resolver = resolver;
        this.reverseRegistrar = reverseRegistrar;
    }
    async createTopLevelDomain(domain) {
        const node = namehash(domain);
        this.registrars = {
            ...this.registrars,
            [domain]: await utils_1.deployContract(this.signer, ens_1.FIFSRegistrar, [this.ens.address, node])
        };
        await this.ens.setSubnodeOwner(HashZero, ethers_1.utils.id(domain), this.registrars[domain].address);
    }
    async createSubDomainNonRecursive(domain) {
        const { label, node, decodedRootNode } = utils_1.getDomainInfo(domain);
        await this.registrars[decodedRootNode].register(label, await this.signer.getAddress());
        await this.ens.setResolver(node, this.resolver.address);
        const registrar = await utils_1.deployContract(this.signer, ens_1.FIFSRegistrar, [this.ens.address, node]);
        await this.ens.setOwner(node, registrar.address);
        this.registrars = {
            ...this.registrars,
            [domain]: registrar
        };
    }
    async createDomain(domain, options) {
        try {
            utils_1.getDomainInfo(domain);
            await this.createSubDomain(domain, options);
        }
        catch (err) {
            if (err instanceof errors_1.ExpectedTopLevelDomain) {
                await this.createTopLevelDomain(domain);
            }
            else {
                throw err;
            }
        }
    }
    async ensureDomainExist(domain, options) {
        const recursive = (options === null || options === void 0 ? void 0 : options.recursive) || false;
        if (!this.registrars[domain]) {
            if (recursive) {
                await this.createDomain(domain, options);
            }
            else {
                throw new errors_1.MissingDomain(domain);
            }
        }
    }
    async createSubDomain(domain, options) {
        const { decodedRootNode } = utils_1.getDomainInfo(domain);
        await this.ensureDomainExist(decodedRootNode, options);
        await this.createSubDomainNonRecursive(domain);
    }
    async setAddressNonRecursive(domain, address) {
        const { node, label, decodedRootNode } = utils_1.getDomainInfo(domain);
        const registrar = this.registrars[decodedRootNode];
        await registrar.register(label, await this.signer.getAddress());
        await this.ens.setResolver(node, this.resolver.address);
        await this.resolver['setAddr(bytes32,uint256,bytes)'](node, utils_1.COIN_TYPE_ETH, address);
    }
    async setAddress(domain, address, options) {
        const { decodedRootNode } = utils_1.getDomainInfo(domain);
        await this.ensureDomainExist(decodedRootNode, options);
        await this.setAddressNonRecursive(domain, address);
    }
    async setAddressWithReverse(domain, signer, options) {
        await this.setAddress(domain, await signer.getAddress(), options);
        await this.reverseRegistrar.connect(signer).setName(domain);
    }
}
exports.ENS = ENS;

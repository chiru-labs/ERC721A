import { ENSRegistry, FIFSRegistrar, ReverseRegistrar } from '@ensdomains/ens';
import { PublicResolver } from '@ensdomains/resolver';
import { constants, utils } from 'ethers';
import { COIN_TYPE_ETH, deployContract, getDomainInfo } from './utils';
import { ExpectedTopLevelDomain, MissingDomain } from './errors';
const { namehash } = utils;
const { HashZero } = constants;
export async function createResolver(signer, ens) {
    const resolver = await deployContract(signer, PublicResolver, [ens.address]);
    const resolverNode = namehash('resolver');
    const resolverLabel = utils.id('resolver');
    await ens.setSubnodeOwner(HashZero, resolverLabel, await signer.getAddress());
    await ens.setResolver(resolverNode, resolver.address);
    await resolver['setAddr(bytes32,uint256,bytes)'](resolverNode, COIN_TYPE_ETH, resolver.address);
    return resolver;
}
export async function createReverseRegistrar(signer, ens, resolver) {
    const reverseRegistrar = await deployContract(signer, ReverseRegistrar, [ens.address, resolver.address]);
    await ens.setSubnodeOwner(HashZero, utils.id('reverse'), await signer.getAddress());
    await ens.setSubnodeOwner(namehash('reverse'), utils.id('addr'), reverseRegistrar.address);
    return reverseRegistrar;
}
export async function deployENS(signer) {
    const ens = await deployContract(signer, ENSRegistry, []);
    const resolver = await createResolver(signer, ens);
    const reverseRegistrar = await createReverseRegistrar(signer, ens, resolver);
    return new ENS(signer, ens, resolver, reverseRegistrar);
}
export class ENS {
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
            [domain]: await deployContract(this.signer, FIFSRegistrar, [this.ens.address, node])
        };
        await this.ens.setSubnodeOwner(HashZero, utils.id(domain), this.registrars[domain].address);
    }
    async createSubDomainNonRecursive(domain) {
        const { label, node, decodedRootNode } = getDomainInfo(domain);
        await this.registrars[decodedRootNode].register(label, await this.signer.getAddress());
        await this.ens.setResolver(node, this.resolver.address);
        const registrar = await deployContract(this.signer, FIFSRegistrar, [this.ens.address, node]);
        await this.ens.setOwner(node, registrar.address);
        this.registrars = {
            ...this.registrars,
            [domain]: registrar
        };
    }
    async createDomain(domain, options) {
        try {
            getDomainInfo(domain);
            await this.createSubDomain(domain, options);
        }
        catch (err) {
            if (err instanceof ExpectedTopLevelDomain) {
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
                throw new MissingDomain(domain);
            }
        }
    }
    async createSubDomain(domain, options) {
        const { decodedRootNode } = getDomainInfo(domain);
        await this.ensureDomainExist(decodedRootNode, options);
        await this.createSubDomainNonRecursive(domain);
    }
    async setAddressNonRecursive(domain, address) {
        const { node, label, decodedRootNode } = getDomainInfo(domain);
        const registrar = this.registrars[decodedRootNode];
        await registrar.register(label, await this.signer.getAddress());
        await this.ens.setResolver(node, this.resolver.address);
        await this.resolver['setAddr(bytes32,uint256,bytes)'](node, COIN_TYPE_ETH, address);
    }
    async setAddress(domain, address, options) {
        const { decodedRootNode } = getDomainInfo(domain);
        await this.ensureDomainExist(decodedRootNode, options);
        await this.setAddressNonRecursive(domain, address);
    }
    async setAddressWithReverse(domain, signer, options) {
        await this.setAddress(domain, await signer.getAddress(), options);
        await this.reverseRegistrar.connect(signer).setName(domain);
    }
}

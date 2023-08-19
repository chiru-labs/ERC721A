import { Contract, Signer } from 'ethers';
interface DomainRegistrationOptions {
    recursive?: boolean;
}
export declare function createResolver(signer: Signer, ens: Contract): Promise<Contract>;
export declare function createReverseRegistrar(signer: Signer, ens: Contract, resolver: Contract): Promise<Contract>;
export declare function deployENS(signer: Signer): Promise<ENS>;
export declare class ENS {
    signer: Signer;
    ens: Contract;
    resolver: Contract;
    registrars: Record<string, Contract>;
    reverseRegistrar: Contract;
    constructor(signer: Signer, ens: Contract, resolver: Contract, reverseRegistrar: Contract);
    createTopLevelDomain(domain: string): Promise<void>;
    createSubDomainNonRecursive(domain: string): Promise<void>;
    createDomain(domain: string, options?: DomainRegistrationOptions): Promise<void>;
    ensureDomainExist(domain: string, options?: DomainRegistrationOptions): Promise<void>;
    createSubDomain(domain: string, options?: DomainRegistrationOptions): Promise<void>;
    setAddressNonRecursive(domain: string, address: string): Promise<void>;
    setAddress(domain: string, address: string, options?: DomainRegistrationOptions): Promise<void>;
    setAddressWithReverse(domain: string, signer: Signer, options?: DomainRegistrationOptions): Promise<void>;
}
export {};

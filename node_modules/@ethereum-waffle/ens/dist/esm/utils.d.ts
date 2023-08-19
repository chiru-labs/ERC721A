import { Signer } from 'ethers';
export declare const COIN_TYPE_ETH = 60;
export declare const deployContract: (signer: Signer, contractJSON: any, args: Array<any>) => Promise<import("ethers").Contract>;
interface ENSDomainInfo {
    chunks: string[];
    tld: string;
    rawLabel: string;
    label: string;
    node: string;
    rootNode: string;
    decodedRootNode: string;
}
export declare const getDomainInfo: (domain: string) => ENSDomainInfo;
export {};

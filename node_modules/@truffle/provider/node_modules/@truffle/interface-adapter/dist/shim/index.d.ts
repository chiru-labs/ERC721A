import Web3 from "web3";
import type { Provider } from "web3/providers";
export declare type NetworkType = string;
export interface Web3ShimOptions {
    provider?: Provider;
    networkType?: NetworkType;
}
export declare type InitNetworkType = (web3Shim: Web3Shim) => Promise<void>;
export interface NetworkTypeDefinition {
    initNetworkType: InitNetworkType;
}
export declare type NetworkTypesConfig = Map<NetworkType, NetworkTypeDefinition>;
export declare class Web3Shim extends Web3 {
    networkType: NetworkType;
    constructor(options?: Web3ShimOptions);
    setNetworkType(networkType: NetworkType): void;
}

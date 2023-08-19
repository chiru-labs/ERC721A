interface LoaderConfig {
    provider: any;
    defaultSender?: string;
    defaultGas?: number;
    defaultGasPrice?: number;
    artifactsDir?: string;
}
interface Loader {
    fromABI(abi: object, bytecode?: string, address?: string): any;
    fromArtifact(name: string, address?: string): any;
}
declare abstract class BaseLoader implements Loader {
    web3?: any;
    provider: any;
    defaultSender?: string;
    defaultGas?: number;
    defaultGasPrice?: number;
    artifactsDir: string;
    constructor(providerOrWeb3: any, defaultSender?: string, defaultGas?: number, defaultGasPrice?: number, artifactsDir?: string);
    fromArtifact(contract: string, address?: string): any;
    abstract fromABI(abi: object, bytecode?: string, address?: string): any;
}
export declare class Web3Loader extends BaseLoader {
    private _web3Contract;
    fromABI(abi: object, bytecode?: string, address?: string): any;
    protected readonly web3Contract: any;
}
export declare class TruffleLoader extends BaseLoader {
    private _truffleContract;
    fromABI(abi: object, bytecode?: string, address?: string): any;
    protected readonly truffleContract: any;
}
export declare function setupLoader({ provider, defaultSender, defaultGas, defaultGasPrice, artifactsDir, }: LoaderConfig): {
    web3: Web3Loader;
    truffle: TruffleLoader;
};
export {};

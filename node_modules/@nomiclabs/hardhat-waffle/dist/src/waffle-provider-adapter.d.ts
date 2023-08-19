import { providers, Wallet } from "ethers";
import { Network } from "hardhat/types";
export declare class WaffleMockProviderAdapter extends providers.JsonRpcProvider {
    private _hardhatNetwork;
    constructor(_hardhatNetwork: Network);
    getWallets(): Wallet[];
    createEmptyWallet(): Wallet;
    send(method: string, params: any): Promise<any>;
}
//# sourceMappingURL=waffle-provider-adapter.d.ts.map
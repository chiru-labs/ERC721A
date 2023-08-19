import { providers, Wallet } from 'ethers';
import { RecordedCall } from './CallHistory';
import type Ganache from 'ganache-core';
import { ENS } from '@ethereum-waffle/ens';
export { RecordedCall };
interface MockProviderOptions {
    ganacheOptions: Ganache.IProviderOptions;
}
export declare class MockProvider extends providers.Web3Provider {
    private options?;
    private _callHistory;
    private _ens?;
    constructor(options?: MockProviderOptions | undefined);
    getWallets(): Wallet[];
    createEmptyWallet(): Wallet;
    clearCallHistory(): void;
    get callHistory(): readonly RecordedCall[];
    get ens(): ENS | undefined;
    setupENS(wallet?: Wallet): Promise<void>;
}

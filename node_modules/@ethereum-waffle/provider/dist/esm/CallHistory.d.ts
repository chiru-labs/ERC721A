import { providers } from 'ethers';
export interface RecordedCall {
    readonly address: string | undefined;
    readonly data: string;
}
export declare class CallHistory {
    private recordedCalls;
    clear(): void;
    getCalls(): RecordedCall[];
    record(provider: providers.Web3Provider): void;
}

import type { Provider, Callback, JsonRPCResponse } from "web3/providers";
import type { parsedUriObject } from "typings";
declare const Blockchain: {
    getBlockByNumber(blockNumber: string, provider: Provider, callback: Callback<JsonRPCResponse>): void;
    getBlockByHash(blockHash: string, provider: Provider, callback: Callback<JsonRPCResponse>): void;
    parse(uri: string): parsedUriObject;
    asURI(provider: Provider): Promise<unknown>;
    matches(uri: string, provider: Provider): Promise<unknown>;
};
export = Blockchain;

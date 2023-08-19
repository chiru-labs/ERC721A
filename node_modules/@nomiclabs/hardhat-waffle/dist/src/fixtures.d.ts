import { MockProvider } from "ethereum-waffle";
import { providers, Signer } from "ethers";
declare type Fixture<T> = (signers: Signer[], provider: providers.JsonRpcProvider) => Promise<T>;
export declare function hardhatCreateFixtureLoader(hardhatWaffleProvider: MockProvider, overrideSigners: Signer[], overrideProvider?: providers.JsonRpcProvider): <T>(fixture: Fixture<T>) => Promise<T>;
export {};
//# sourceMappingURL=fixtures.d.ts.map
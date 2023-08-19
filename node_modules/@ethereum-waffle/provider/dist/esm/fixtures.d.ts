import { Wallet } from 'ethers';
import { MockProvider } from './MockProvider';
export declare type Fixture<T> = (wallets: Wallet[], provider: MockProvider) => Promise<T>;
export declare const loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
export declare function createFixtureLoader(overrideWallets?: Wallet[], overrideProvider?: MockProvider): <T>(fixture: Fixture<T>) => Promise<T>;

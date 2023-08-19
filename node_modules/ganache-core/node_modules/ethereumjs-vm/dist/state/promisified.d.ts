/// <reference types="node" />
import Account from 'ethereumjs-account';
import { default as StateManager, StorageDump } from './stateManager';
/**
 * Promisified wrapper around [[StateManager]]
 * @ignore
 */
export default class PStateManager {
    _wrapped: StateManager;
    readonly getAccount: (addr: Buffer) => Promise<Account>;
    readonly putAccount: (addr: Buffer, account: Account) => Promise<void>;
    readonly putContractCode: (addr: Buffer, code: Buffer) => Promise<void>;
    readonly getContractCode: (addr: Buffer) => Promise<Buffer>;
    readonly getContractStorage: (addr: Buffer, key: Buffer) => Promise<any>;
    readonly getOriginalContractStorage: (addr: Buffer, key: Buffer) => Promise<any>;
    readonly putContractStorage: (addr: Buffer, key: Buffer, value: Buffer) => Promise<void>;
    readonly clearContractStorage: (addr: Buffer) => Promise<void>;
    readonly checkpoint: () => Promise<void>;
    readonly commit: () => Promise<void>;
    readonly revert: () => Promise<void>;
    readonly getStateRoot: () => Promise<Buffer>;
    readonly setStateRoot: (root: Buffer) => Promise<void>;
    readonly dumpStorage: (address: Buffer) => Promise<StorageDump>;
    readonly hasGenesisState: () => Promise<boolean>;
    readonly generateCanonicalGenesis: () => Promise<void>;
    readonly generateGenesis: (initState: any) => Promise<void>;
    readonly accountIsEmpty: (address: Buffer) => Promise<boolean>;
    readonly cleanupTouchedAccounts: () => Promise<void>;
    constructor(wrapped: StateManager);
    copy(): PStateManager;
}

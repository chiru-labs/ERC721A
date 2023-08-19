/// <reference types="node" />
import { SecureTrie as Trie } from 'merkle-patricia-tree';
import { Account, Address } from 'ethereumjs-util';
import Common from '@ethereumjs/common';
import { StateManager, StorageDump } from './interface';
import Cache from './cache';
import { AccessList } from '@ethereumjs/tx';
declare type AddressHex = string;
/**
 * Options for constructing a {@link StateManager}.
 */
export interface DefaultStateManagerOpts {
    /**
     * Parameters of the chain {@link Common}
     */
    common?: Common;
    /**
     * A {@link SecureTrie} instance
     */
    trie?: Trie;
}
/**
 * Interface for getting and setting data from an underlying
 * state trie.
 */
export default class DefaultStateManager implements StateManager {
    _common: Common;
    _trie: Trie;
    _storageTries: {
        [key: string]: Trie;
    };
    _cache: Cache;
    _touched: Set<AddressHex>;
    _touchedStack: Set<AddressHex>[];
    _checkpointCount: number;
    _originalStorageCache: Map<AddressHex, Map<AddressHex, Buffer>>;
    _accessedStorage: Map<string, Set<string>>[];
    _accessedStorageReverted: Map<string, Set<string>>[];
    /**
     * StateManager is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    protected readonly DEBUG: boolean;
    /**
     * Instantiate the StateManager interface.
     */
    constructor(opts?: DefaultStateManagerOpts);
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     */
    copy(): StateManager;
    /**
     * Gets the account associated with `address`. Returns an empty account if the account does not exist.
     * @param address - Address of the `account` to get
     */
    getAccount(address: Address): Promise<Account>;
    /**
     * Saves an account into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The account to store
     */
    putAccount(address: Address, account: Account): Promise<void>;
    /**
     * Deletes an account from state under the provided `address`. The account will also be removed from the state trie.
     * @param address - Address of the account which should be deleted
     */
    deleteAccount(address: Address): Promise<void>;
    /**
     * Marks an account as touched, according to the definition
     * in [EIP-158](https://eips.ethereum.org/EIPS/eip-158).
     * This happens when the account is triggered for a state-changing
     * event. Touched accounts that are empty will be cleared
     * at the end of the tx.
     */
    touchAccount(address: Address): void;
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     */
    putContractCode(address: Address, value: Buffer): Promise<void>;
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Buffer>} -  Resolves with the code corresponding to the provided address.
     * Returns an empty `Buffer` if the account has no associated code.
     */
    getContractCode(address: Address): Promise<Buffer>;
    /**
     * Creates a storage trie from the primary storage trie
     * for an account and saves this in the storage cache.
     * @private
     */
    _lookupStorageTrie(address: Address): Promise<Trie>;
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    _getStorageTrie(address: Address): Promise<Trie>;
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Promise<Buffer>} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Buffer` is returned.
     */
    getContractStorage(address: Address, key: Buffer): Promise<Buffer>;
    /**
     * Caches the storage value associated with the provided `address` and `key`
     * on first invocation, and returns the cached (original) value from then
     * onwards. This is used to get the original value of a storage slot for
     * computing gas costs according to EIP-1283.
     * @param address - Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     */
    getOriginalContractStorage(address: Address, key: Buffer): Promise<Buffer>;
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation.
     */
    _clearOriginalStorageCache(): void;
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation. Alias of the internal {@link StateManager._clearOriginalStorageCache}
     */
    clearOriginalStorageCache(): void;
    /**
     * Modifies the storage trie of an account.
     * @private
     * @param address -  Address of the account whose storage is to be modified
     * @param modifyTrie - Function to modify the storage trie of the account
     */
    _modifyContractStorage(address: Address, modifyTrie: (storageTrie: Trie, done: Function) => void): Promise<void>;
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`. Cannot be more than 32 bytes. Leading zeros are stripped. If it is a empty or filled with zeros, deletes the value.
     */
    putContractStorage(address: Address, key: Buffer, value: Buffer): Promise<void>;
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     */
    clearContractStorage(address: Address): Promise<void>;
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     */
    checkpoint(): Promise<void>;
    /**
     * Merges a storage map into the last item of the accessed storage stack
     */
    private _accessedStorageMerge;
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     */
    commit(): Promise<void>;
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     */
    revert(): Promise<void>;
    /**
     * Gets the state-root of the Merkle-Patricia trie representation
     * of the state of this StateManager. Will error if there are uncommitted
     * checkpoints on the instance.
     * @returns {Promise<Buffer>} - Returns the state-root of the `StateManager`
     */
    getStateRoot(): Promise<Buffer>;
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @param stateRoot - The state-root to reset the instance to
     */
    setStateRoot(stateRoot: Buffer): Promise<void>;
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    dumpStorage(address: Address): Promise<StorageDump>;
    /**
     * Checks whether the current instance has the canonical genesis state
     * for the configured chain parameters.
     * @returns {Promise<boolean>} - Whether the storage trie contains the
     * canonical genesis state for the configured chain parameters.
     */
    hasGenesisState(): Promise<boolean>;
    /**
     * Generates a canonical genesis state on the instance based on the
     * configured chain parameters. Will error if there are uncommitted
     * checkpoints on the instance.
     */
    generateCanonicalGenesis(): Promise<void>;
    /**
     * Initializes the provided genesis state into the state trie
     * @param initState address -> balance | [balance, code, storage]
     */
    generateGenesis(initState: any): Promise<void>;
    /**
     * Checks if the `account` corresponding to `address`
     * is empty or non-existent as defined in
     * EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     * @param address - Address to check
     */
    accountIsEmpty(address: Address): Promise<boolean>;
    /**
     * Checks if the `account` corresponding to `address`
     * exists
     * @param address - Address of the `account` to check
     */
    accountExists(address: Address): Promise<boolean>;
    /** EIP-2929 logic
     * This should only be called from within the EVM
     */
    /**
     * Returns true if the address is warm in the current context
     * @param address - The address (as a Buffer) to check
     */
    isWarmedAddress(address: Buffer): boolean;
    /**
     * Add a warm address in the current context
     * @param address - The address (as a Buffer) to check
     */
    addWarmedAddress(address: Buffer): void;
    /**
     * Returns true if the slot of the address is warm
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    isWarmedStorage(address: Buffer, slot: Buffer): boolean;
    /**
     * Mark the storage slot in the address as warm in the current context
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    addWarmedStorage(address: Buffer, slot: Buffer): void;
    /**
     * Clear the warm accounts and storage. To be called after a transaction finished.
     * @param boolean - If true, returns an EIP-2930 access list generated
     */
    clearWarmedAccounts(): void;
    /**
     * Generates an EIP-2930 access list
     *
     * Note: this method is not yet part of the {@link StateManager} interface.
     * If not implemented, {@link VM.runTx} is not allowed to be used with the
     * `reportAccessList` option and will instead throw.
     *
     * Note: there is an edge case on accessList generation where an
     * internal call might revert without an accessList but pass if the
     * accessList is used for a tx run (so the subsequent behavior might change).
     * This edge case is not covered by this implementation.
     *
     * @param addressesRemoved - List of addresses to be removed from the final list
     * @param addressesOnlyStorage - List of addresses only to be added in case of present storage slots
     *
     * @returns - an [@ethereumjs/tx](https://github.com/ethereumjs/ethereumjs-monorepo/packages/tx) `AccessList`
     */
    generateAccessList(addressesRemoved?: Address[], addressesOnlyStorage?: Address[]): AccessList;
    /**
     * Removes accounts form the state trie that have been touched,
     * as defined in EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     */
    cleanupTouchedAccounts(): Promise<void>;
}
export {};

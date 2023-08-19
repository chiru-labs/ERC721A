/// <reference types="node" />
import Common from 'ethereumjs-common';
import Account from 'ethereumjs-account';
import Cache from './cache';
/**
 * Storage values of an account
 */
export interface StorageDump {
    [key: string]: string;
}
/**
 * Options for constructing a [[StateManager]].
 */
export interface StateManagerOpts {
    /**
     * Parameters of the chain ([`Common`](https://github.com/ethereumjs/ethereumjs-common))
     */
    common?: Common;
    /**
     * A [`merkle-patricia-tree`](https://github.com/ethereumjs/merkle-patricia-tree) instance
     */
    trie?: any;
}
/**
 * Interface for getting and setting data from an underlying
 * state trie.
 */
export default class StateManager {
    _common: Common;
    _trie: any;
    _storageTries: any;
    _cache: Cache;
    _touched: Set<string>;
    _touchedStack: Set<string>[];
    _checkpointCount: number;
    _originalStorageCache: Map<string, Map<string, Buffer>>;
    /**
     * Instantiate the StateManager interface.
     */
    constructor(opts?: StateManagerOpts);
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     */
    copy(): StateManager;
    /**
     * Callback for `getAccount` method.
     * @callback getAccount~callback
     * @param error - an error that may have happened or `null`
     * @param account - An [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account)
     * instance corresponding to the provided `address`
     */
    /**
     * Gets the [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account)
     * associated with `address`. Returns an empty account if the account does not exist.
     * @param address - Address of the `account` to get
     * @param {getAccount~callback} cb
     */
    getAccount(address: Buffer, cb: any): void;
    /**
     * Saves an [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account)
     * into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account) to store
     * @param cb - Callback function
     */
    putAccount(address: Buffer, account: Account, cb: any): void;
    /**
     * Marks an account as touched, according to the definition
     * in [EIP-158](https://eips.ethereum.org/EIPS/eip-158).
     * This happens when the account is triggered for a state-changing
     * event. Touched accounts that are empty will be cleared
     * at the end of the tx.
     */
    touchAccount(address: Buffer): void;
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     * @param cb - Callback function
     */
    putContractCode(address: Buffer, value: Buffer, cb: any): void;
    /**
     * Callback for `getContractCode` method
     * @callback getContractCode~callback
     * @param error - an error that may have happened or `null`
     * @param code - The code corresponding to the provided address.
     * Returns an empty `Buffer` if the account has no associated code.
     */
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @param {getContractCode~callback} cb
     */
    getContractCode(address: Buffer, cb: any): void;
    /**
     * Creates a storage trie from the primary storage trie
     * for an account and saves this in the storage cache.
     * @private
     */
    _lookupStorageTrie(address: Buffer, cb: any): void;
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    _getStorageTrie(address: Buffer, cb: any): void;
    /**
     * Callback for `getContractStorage` method
     * @callback getContractStorage~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Buffer} storageValue The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exists an empty `Buffer` is returned
     */
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @param {getContractCode~callback} cb.
     */
    getContractStorage(address: Buffer, key: Buffer, cb: any): void;
    /**
     * Caches the storage value associated with the provided `address` and `key`
     * on first invocation, and returns the cached (original) value from then
     * onwards. This is used to get the original value of a storage slot for
     * computing gas costs according to EIP-1283.
     * @param address - Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     */
    getOriginalContractStorage(address: Buffer, key: Buffer, cb: any): void;
    /**
     * Modifies the storage trie of an account
     * @private
     * @param address -  Address of the account whose storage is to be modified
     * @param modifyTrie - Function to modify the storage trie of the account
     */
    _modifyContractStorage(address: Buffer, modifyTrie: any, cb: any): void;
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`
     * @param cb - Callback function
     */
    putContractStorage(address: Buffer, key: Buffer, value: Buffer, cb: any): void;
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     * @param cb - Callback function
     */
    clearContractStorage(address: Buffer, cb: any): void;
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     * @param cb - Callback function
     */
    checkpoint(cb: any): void;
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     * @param cb - Callback function
     */
    commit(cb: any): void;
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     * @param cb - Callback function
     */
    revert(cb: any): void;
    /**
     * Callback for `getStateRoot` method
     * @callback getStateRoot~callback
     * @param {Error} error an error that may have happened or `null`.
     * Will be an error if the un-committed checkpoints on the instance.
     * @param {Buffer} stateRoot The state-root of the `StateManager`
     */
    /**
     * Gets the state-root of the Merkle-Patricia trie representation
     * of the state of this StateManager. Will error if there are uncommitted
     * checkpoints on the instance.
     * @param {getStateRoot~callback} cb
     */
    getStateRoot(cb: any): void;
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @param stateRoot - The state-root to reset the instance to
     * @param cb - Callback function
     */
    setStateRoot(stateRoot: Buffer, cb: any): void;
    /**
     * Callback for `dumpStorage` method
     * @callback dumpStorage~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Object} accountState The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    /**
     * Dumps the the storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @param {dumpStorage~callback} cb
     */
    dumpStorage(address: Buffer, cb: any): void;
    /**
     * Callback for `hasGenesisState` method
     * @callback hasGenesisState~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Boolean} hasGenesisState Whether the storage trie contains the
     * canonical genesis state for the configured chain parameters.
     */
    /**
     * Checks whether the current instance has the canonical genesis state
     * for the configured chain parameters.
     * @param {hasGenesisState~callback} cb
     */
    hasGenesisState(cb: any): void;
    /**
     * Generates a canonical genesis state on the instance based on the
     * configured chain parameters. Will error if there are uncommitted
     * checkpoints on the instance.
     * @param cb - Callback function
     */
    generateCanonicalGenesis(cb: any): void;
    /**
     * Initializes the provided genesis state into the state trie
     * @param initState - Object (address -> balance)
     * @param cb - Callback function
     */
    generateGenesis(initState: any, cb: any): any;
    /**
     * Callback for `accountIsEmpty` method
     * @callback accountIsEmpty~callback
     * @param {Error} error an error that may have happened or `null`
     * @param {Boolean} empty True if the account is empty false otherwise
     */
    /**
     * Checks if the `account` corresponding to `address` is empty as defined in
     * EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     * @param address - Address to check
     * @param {accountIsEmpty~callback} cb
     */
    accountIsEmpty(address: Buffer, cb: any): void;
    /**
     * Removes accounts form the state trie that have been touched,
     * as defined in EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     * @param cb - Callback function
     */
    cleanupTouchedAccounts(cb: any): void;
    /**
     * Clears the original storage cache. Refer to [[getOriginalContractStorage]]
     * for more explanation.
     * @ignore
     */
    _clearOriginalStorageCache(): void;
}

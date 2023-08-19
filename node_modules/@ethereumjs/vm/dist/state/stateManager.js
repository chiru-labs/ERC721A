"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Set = require('core-js-pure/es/set');
const debug_1 = require("debug");
const merkle_patricia_tree_1 = require("merkle-patricia-tree");
const ethereumjs_util_1 = require("ethereumjs-util");
const common_1 = __importStar(require("@ethereumjs/common"));
const cache_1 = __importDefault(require("./cache"));
const precompiles_1 = require("../evm/precompiles");
const opcodes_1 = require("../evm/opcodes");
const debug = (0, debug_1.debug)('vm:state');
/**
 * Interface for getting and setting data from an underlying
 * state trie.
 */
class DefaultStateManager {
    /**
     * Instantiate the StateManager interface.
     */
    constructor(opts = {}) {
        var _a;
        /**
         * StateManager is run in DEBUG mode (default: false)
         * Taken from DEBUG environment variable
         *
         * Safeguards on debug() calls are added for
         * performance reasons to avoid string literal evaluation
         * @hidden
         */
        this.DEBUG = false;
        let common = opts.common;
        if (!common) {
            common = new common_1.default({ chain: common_1.Chain.Mainnet, hardfork: common_1.Hardfork.Petersburg });
        }
        this._common = common;
        this._trie = (_a = opts.trie) !== null && _a !== void 0 ? _a : new merkle_patricia_tree_1.SecureTrie();
        this._storageTries = {};
        this._cache = new cache_1.default(this._trie);
        this._touched = new Set();
        this._touchedStack = [];
        this._checkpointCount = 0;
        this._originalStorageCache = new Map();
        this._accessedStorage = [new Map()];
        this._accessedStorageReverted = [new Map()];
        // Safeguard if "process" is not available (browser)
        if (process !== undefined && process.env.DEBUG) {
            this.DEBUG = true;
        }
    }
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     */
    copy() {
        return new DefaultStateManager({
            trie: this._trie.copy(false),
            common: this._common,
        });
    }
    /**
     * Gets the account associated with `address`. Returns an empty account if the account does not exist.
     * @param address - Address of the `account` to get
     */
    async getAccount(address) {
        const account = await this._cache.getOrLoad(address);
        return account;
    }
    /**
     * Saves an account into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The account to store
     */
    async putAccount(address, account) {
        if (this.DEBUG) {
            debug(`Save account address=${address} nonce=${account.nonce} balance=${account.balance} contract=${account.isContract() ? 'yes' : 'no'} empty=${account.isEmpty() ? 'yes' : 'no'}`);
        }
        this._cache.put(address, account);
        this.touchAccount(address);
    }
    /**
     * Deletes an account from state under the provided `address`. The account will also be removed from the state trie.
     * @param address - Address of the account which should be deleted
     */
    async deleteAccount(address) {
        if (this.DEBUG) {
            debug(`Delete account ${address}`);
        }
        this._cache.del(address);
        this.touchAccount(address);
    }
    /**
     * Marks an account as touched, according to the definition
     * in [EIP-158](https://eips.ethereum.org/EIPS/eip-158).
     * This happens when the account is triggered for a state-changing
     * event. Touched accounts that are empty will be cleared
     * at the end of the tx.
     */
    touchAccount(address) {
        this._touched.add(address.buf.toString('hex'));
    }
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     */
    async putContractCode(address, value) {
        const codeHash = (0, ethereumjs_util_1.keccak256)(value);
        if (codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
            return;
        }
        await this._trie.db.put(codeHash, value);
        const account = await this.getAccount(address);
        if (this.DEBUG) {
            debug(`Update codeHash (-> ${(0, opcodes_1.short)(codeHash)}) for account ${address}`);
        }
        account.codeHash = codeHash;
        await this.putAccount(address, account);
    }
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Buffer>} -  Resolves with the code corresponding to the provided address.
     * Returns an empty `Buffer` if the account has no associated code.
     */
    async getContractCode(address) {
        const account = await this.getAccount(address);
        if (!account.isContract()) {
            return Buffer.alloc(0);
        }
        const code = await this._trie.db.get(account.codeHash);
        return code !== null && code !== void 0 ? code : Buffer.alloc(0);
    }
    /**
     * Creates a storage trie from the primary storage trie
     * for an account and saves this in the storage cache.
     * @private
     */
    async _lookupStorageTrie(address) {
        // from state trie
        const account = await this.getAccount(address);
        const storageTrie = this._trie.copy(false);
        storageTrie.root = account.stateRoot;
        storageTrie.db.checkpoints = [];
        return storageTrie;
    }
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    async _getStorageTrie(address) {
        // from storage cache
        const addressHex = address.buf.toString('hex');
        let storageTrie = this._storageTries[addressHex];
        if (!storageTrie) {
            // lookup from state
            storageTrie = await this._lookupStorageTrie(address);
        }
        return storageTrie;
    }
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Promise<Buffer>} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Buffer` is returned.
     */
    async getContractStorage(address, key) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        const trie = await this._getStorageTrie(address);
        const value = await trie.get(key);
        const decoded = ethereumjs_util_1.rlp.decode(value);
        return decoded;
    }
    /**
     * Caches the storage value associated with the provided `address` and `key`
     * on first invocation, and returns the cached (original) value from then
     * onwards. This is used to get the original value of a storage slot for
     * computing gas costs according to EIP-1283.
     * @param address - Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     */
    async getOriginalContractStorage(address, key) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        const addressHex = address.buf.toString('hex');
        const keyHex = key.toString('hex');
        let map;
        if (!this._originalStorageCache.has(addressHex)) {
            map = new Map();
            this._originalStorageCache.set(addressHex, map);
        }
        else {
            map = this._originalStorageCache.get(addressHex);
        }
        if (map.has(keyHex)) {
            return map.get(keyHex);
        }
        else {
            const current = await this.getContractStorage(address, key);
            map.set(keyHex, current);
            return current;
        }
    }
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation.
     */
    _clearOriginalStorageCache() {
        this._originalStorageCache = new Map();
    }
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation. Alias of the internal {@link StateManager._clearOriginalStorageCache}
     */
    clearOriginalStorageCache() {
        this._clearOriginalStorageCache();
    }
    /**
     * Modifies the storage trie of an account.
     * @private
     * @param address -  Address of the account whose storage is to be modified
     * @param modifyTrie - Function to modify the storage trie of the account
     */
    async _modifyContractStorage(address, modifyTrie) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            const storageTrie = await this._getStorageTrie(address);
            modifyTrie(storageTrie, async () => {
                // update storage cache
                const addressHex = address.buf.toString('hex');
                this._storageTries[addressHex] = storageTrie;
                // update contract stateRoot
                const contract = this._cache.get(address);
                contract.stateRoot = storageTrie.root;
                await this.putAccount(address, contract);
                this.touchAccount(address);
                resolve();
            });
        });
    }
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`. Cannot be more than 32 bytes. Leading zeros are stripped. If it is a empty or filled with zeros, deletes the value.
     */
    async putContractStorage(address, key, value) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        if (value.length > 32) {
            throw new Error('Storage value cannot be longer than 32 bytes');
        }
        value = (0, ethereumjs_util_1.unpadBuffer)(value);
        await this._modifyContractStorage(address, async (storageTrie, done) => {
            if (value && value.length) {
                // format input
                const encodedValue = ethereumjs_util_1.rlp.encode(value);
                if (this.DEBUG) {
                    debug(`Update contract storage for account ${address} to ${(0, opcodes_1.short)(value)}`);
                }
                await storageTrie.put(key, encodedValue);
            }
            else {
                // deleting a value
                if (this.DEBUG) {
                    debug(`Delete contract storage for account`);
                }
                await storageTrie.del(key);
            }
            done();
        });
    }
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     */
    async clearContractStorage(address) {
        await this._modifyContractStorage(address, (storageTrie, done) => {
            storageTrie.root = storageTrie.EMPTY_TRIE_ROOT;
            done();
        });
    }
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     */
    async checkpoint() {
        this._trie.checkpoint();
        this._cache.checkpoint();
        this._touchedStack.push(new Set(Array.from(this._touched)));
        this._accessedStorage.push(new Map());
        this._checkpointCount++;
    }
    /**
     * Merges a storage map into the last item of the accessed storage stack
     */
    _accessedStorageMerge(storageList, storageMap) {
        const mapTarget = storageList[storageList.length - 1];
        if (mapTarget) {
            // Note: storageMap is always defined here per definition (TypeScript cannot infer this)
            storageMap === null || storageMap === void 0 ? void 0 : storageMap.forEach((slotSet, addressString) => {
                const addressExists = mapTarget.get(addressString);
                if (!addressExists) {
                    mapTarget.set(addressString, new Set());
                }
                const storageSet = mapTarget.get(addressString);
                slotSet.forEach((value) => {
                    storageSet.add(value);
                });
            });
        }
    }
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     */
    async commit() {
        // setup trie checkpointing
        await this._trie.commit();
        // setup cache checkpointing
        this._cache.commit();
        this._touchedStack.pop();
        this._checkpointCount--;
        // Copy the contents of the map of the current level to a map higher.
        const storageMap = this._accessedStorage.pop();
        if (storageMap) {
            this._accessedStorageMerge(this._accessedStorage, storageMap);
        }
        if (this._checkpointCount === 0) {
            await this._cache.flush();
            this._clearOriginalStorageCache();
        }
    }
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     */
    async revert() {
        // setup trie checkpointing
        await this._trie.revert();
        // setup cache checkpointing
        this._cache.revert();
        this._storageTries = {};
        const lastItem = this._accessedStorage.pop();
        if (lastItem) {
            this._accessedStorageReverted.push(lastItem);
        }
        const touched = this._touchedStack.pop();
        if (!touched) {
            throw new Error('Reverting to invalid state checkpoint failed');
        }
        // Exceptional case due to consensus issue in Geth and Parity.
        // See [EIP issue #716](https://github.com/ethereum/EIPs/issues/716) for context.
        // The RIPEMD precompile has to remain *touched* even when the call reverts,
        // and be considered for deletion.
        if (this._touched.has(precompiles_1.ripemdPrecompileAddress)) {
            touched.add(precompiles_1.ripemdPrecompileAddress);
        }
        this._touched = touched;
        this._checkpointCount--;
        if (this._checkpointCount === 0) {
            await this._cache.flush();
            this._clearOriginalStorageCache();
        }
    }
    /**
     * Gets the state-root of the Merkle-Patricia trie representation
     * of the state of this StateManager. Will error if there are uncommitted
     * checkpoints on the instance.
     * @returns {Promise<Buffer>} - Returns the state-root of the `StateManager`
     */
    async getStateRoot() {
        await this._cache.flush();
        const stateRoot = this._trie.root;
        return stateRoot;
    }
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @param stateRoot - The state-root to reset the instance to
     */
    async setStateRoot(stateRoot) {
        if (this._checkpointCount !== 0) {
            throw new Error('Cannot set state root with uncommitted checkpoints');
        }
        await this._cache.flush();
        if (!stateRoot.equals(this._trie.EMPTY_TRIE_ROOT)) {
            const hasRoot = await this._trie.checkRoot(stateRoot);
            if (!hasRoot) {
                throw new Error('State trie does not contain state root');
            }
        }
        this._trie.root = stateRoot;
        this._cache.clear();
        this._storageTries = {};
    }
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    async dumpStorage(address) {
        return new Promise((resolve, reject) => {
            this._getStorageTrie(address)
                .then((trie) => {
                const storage = {};
                const stream = trie.createReadStream();
                stream.on('data', (val) => {
                    storage[val.key.toString('hex')] = val.value.toString('hex');
                });
                stream.on('end', () => {
                    resolve(storage);
                });
            })
                .catch((e) => {
                reject(e);
            });
        });
    }
    /**
     * Checks whether the current instance has the canonical genesis state
     * for the configured chain parameters.
     * @returns {Promise<boolean>} - Whether the storage trie contains the
     * canonical genesis state for the configured chain parameters.
     */
    async hasGenesisState() {
        const root = this._common.genesis().stateRoot;
        return await this._trie.checkRoot((0, ethereumjs_util_1.toBuffer)(root));
    }
    /**
     * Generates a canonical genesis state on the instance based on the
     * configured chain parameters. Will error if there are uncommitted
     * checkpoints on the instance.
     */
    async generateCanonicalGenesis() {
        if (this._checkpointCount !== 0) {
            throw new Error('Cannot create genesis state with uncommitted checkpoints');
        }
        const genesis = await this.hasGenesisState();
        if (!genesis) {
            await this.generateGenesis(this._common.genesisState());
        }
    }
    /**
     * Initializes the provided genesis state into the state trie
     * @param initState address -> balance | [balance, code, storage]
     */
    async generateGenesis(initState) {
        if (this._checkpointCount !== 0) {
            throw new Error('Cannot create genesis state with uncommitted checkpoints');
        }
        if (this.DEBUG) {
            debug(`Save genesis state into the state trie`);
        }
        const addresses = Object.keys(initState);
        for (const address of addresses) {
            const addr = ethereumjs_util_1.Address.fromString(address);
            const state = initState[address];
            if (!Array.isArray(state)) {
                // Prior format: address -> balance
                const account = ethereumjs_util_1.Account.fromAccountData({ balance: state });
                await this._trie.put(addr.buf, account.serialize());
            }
            else {
                // New format: address -> [balance, code, storage]
                const [balance, code, storage] = state;
                const account = ethereumjs_util_1.Account.fromAccountData({ balance });
                await this._trie.put(addr.buf, account.serialize());
                if (code) {
                    await this.putContractCode(addr, (0, ethereumjs_util_1.toBuffer)(code));
                }
                if (storage) {
                    for (const [key, value] of Object.values(storage)) {
                        await this.putContractStorage(addr, (0, ethereumjs_util_1.toBuffer)(key), (0, ethereumjs_util_1.toBuffer)(value));
                    }
                }
            }
        }
    }
    /**
     * Checks if the `account` corresponding to `address`
     * is empty or non-existent as defined in
     * EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     * @param address - Address to check
     */
    async accountIsEmpty(address) {
        const account = await this.getAccount(address);
        return account.isEmpty();
    }
    /**
     * Checks if the `account` corresponding to `address`
     * exists
     * @param address - Address of the `account` to check
     */
    async accountExists(address) {
        const account = this._cache.lookup(address);
        if (account && !account.virtual && !this._cache.keyIsDeleted(address)) {
            return true;
        }
        if (await this._cache._trie.get(address.buf)) {
            return true;
        }
        return false;
    }
    /** EIP-2929 logic
     * This should only be called from within the EVM
     */
    /**
     * Returns true if the address is warm in the current context
     * @param address - The address (as a Buffer) to check
     */
    isWarmedAddress(address) {
        for (let i = this._accessedStorage.length - 1; i >= 0; i--) {
            const currentMap = this._accessedStorage[i];
            if (currentMap.has(address.toString('hex'))) {
                return true;
            }
        }
        return false;
    }
    /**
     * Add a warm address in the current context
     * @param address - The address (as a Buffer) to check
     */
    addWarmedAddress(address) {
        const key = address.toString('hex');
        const storageSet = this._accessedStorage[this._accessedStorage.length - 1].get(key);
        if (!storageSet) {
            const emptyStorage = new Set();
            this._accessedStorage[this._accessedStorage.length - 1].set(key, emptyStorage);
        }
    }
    /**
     * Returns true if the slot of the address is warm
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    isWarmedStorage(address, slot) {
        const addressKey = address.toString('hex');
        const storageKey = slot.toString('hex');
        for (let i = this._accessedStorage.length - 1; i >= 0; i--) {
            const currentMap = this._accessedStorage[i];
            if (currentMap.has(addressKey) && currentMap.get(addressKey).has(storageKey)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Mark the storage slot in the address as warm in the current context
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    addWarmedStorage(address, slot) {
        const addressKey = address.toString('hex');
        let storageSet = this._accessedStorage[this._accessedStorage.length - 1].get(addressKey);
        if (!storageSet) {
            storageSet = new Set();
            this._accessedStorage[this._accessedStorage.length - 1].set(addressKey, storageSet);
        }
        storageSet.add(slot.toString('hex'));
    }
    /**
     * Clear the warm accounts and storage. To be called after a transaction finished.
     * @param boolean - If true, returns an EIP-2930 access list generated
     */
    clearWarmedAccounts() {
        this._accessedStorage = [new Map()];
        this._accessedStorageReverted = [new Map()];
    }
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
    generateAccessList(addressesRemoved = [], addressesOnlyStorage = []) {
        // Merge with the reverted storage list
        const mergedStorage = [...this._accessedStorage, ...this._accessedStorageReverted];
        // Fold merged storage array into one Map
        while (mergedStorage.length >= 2) {
            const storageMap = mergedStorage.pop();
            if (storageMap) {
                this._accessedStorageMerge(mergedStorage, storageMap);
            }
        }
        const folded = new Map([...mergedStorage[0].entries()].sort());
        // Transfer folded map to final structure
        const accessList = [];
        folded.forEach((slots, addressStr) => {
            const address = ethereumjs_util_1.Address.fromString(`0x${addressStr}`);
            const check1 = (0, precompiles_1.getActivePrecompiles)(this._common).find((a) => a.equals(address));
            const check2 = addressesRemoved.find((a) => a.equals(address));
            const check3 = addressesOnlyStorage.find((a) => a.equals(address)) !== undefined && slots.size === 0;
            if (!check1 && !check2 && !check3) {
                const storageSlots = Array.from(slots)
                    .map((s) => `0x${s}`)
                    .sort();
                const accessListItem = {
                    address: `0x${addressStr}`,
                    storageKeys: storageSlots,
                };
                accessList.push(accessListItem);
            }
        });
        return accessList;
    }
    /**
     * Removes accounts form the state trie that have been touched,
     * as defined in EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     */
    async cleanupTouchedAccounts() {
        if (this._common.gteHardfork('spuriousDragon')) {
            const touchedArray = Array.from(this._touched);
            for (const addressHex of touchedArray) {
                const address = new ethereumjs_util_1.Address(Buffer.from(addressHex, 'hex'));
                const empty = await this.accountIsEmpty(address);
                if (empty) {
                    this._cache.del(address);
                    if (this.DEBUG) {
                        debug(`Cleanup touched account address=${address} (>= SpuriousDragon)`);
                    }
                }
            }
        }
        this._touched.clear();
    }
}
exports.default = DefaultStateManager;
//# sourceMappingURL=stateManager.js.map
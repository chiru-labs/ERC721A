"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Set = require('core-js-pure/es/set');
var Trie = require('merkle-patricia-tree/secure.js');
var asyncLib = require('async');
var utils = require("ethereumjs-util");
var BN = require("bn.js");
var rlp_1 = require("rlp");
var ethereumjs_common_1 = require("ethereumjs-common");
var genesisStates_1 = require("ethereumjs-common/dist/genesisStates");
var ethereumjs_account_1 = require("ethereumjs-account");
var cache_1 = require("./cache");
var precompiles_1 = require("../evm/precompiles");
/**
 * Interface for getting and setting data from an underlying
 * state trie.
 */
var StateManager = /** @class */ (function () {
    /**
     * Instantiate the StateManager interface.
     */
    function StateManager(opts) {
        if (opts === void 0) { opts = {}; }
        var common = opts.common;
        if (!common) {
            common = new ethereumjs_common_1.default('mainnet', 'petersburg');
        }
        this._common = common;
        this._trie = opts.trie || new Trie();
        this._storageTries = {}; // the storage trie cache
        this._cache = new cache_1.default(this._trie);
        this._touched = new Set();
        this._touchedStack = [];
        this._checkpointCount = 0;
        this._originalStorageCache = new Map();
    }
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     */
    StateManager.prototype.copy = function () {
        return new StateManager({ trie: this._trie.copy(), common: this._common });
    };
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
    StateManager.prototype.getAccount = function (address, cb) {
        this._cache.getOrLoad(address, cb);
    };
    /**
     * Saves an [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account)
     * into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The [`ethereumjs-account`](https://github.com/ethereumjs/ethereumjs-account) to store
     * @param cb - Callback function
     */
    StateManager.prototype.putAccount = function (address, account, cb) {
        // TODO: dont save newly created accounts that have no balance
        // if (toAccount.balance.toString('hex') === '00') {
        // if they have money or a non-zero nonce or code, then write to tree
        this._cache.put(address, account);
        this.touchAccount(address);
        // self._trie.put(addressHex, account.serialize(), cb)
        cb();
    };
    /**
     * Marks an account as touched, according to the definition
     * in [EIP-158](https://eips.ethereum.org/EIPS/eip-158).
     * This happens when the account is triggered for a state-changing
     * event. Touched accounts that are empty will be cleared
     * at the end of the tx.
     */
    StateManager.prototype.touchAccount = function (address) {
        this._touched.add(address.toString('hex'));
    };
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     * @param cb - Callback function
     */
    StateManager.prototype.putContractCode = function (address, value, cb) {
        var _this = this;
        this.getAccount(address, function (err, account) {
            if (err) {
                return cb(err);
            }
            // TODO: setCode use trie.setRaw which creates a storage leak
            account.setCode(_this._trie, value, function (err) {
                if (err) {
                    return cb(err);
                }
                _this.putAccount(address, account, cb);
            });
        });
    };
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
    StateManager.prototype.getContractCode = function (address, cb) {
        var _this = this;
        this.getAccount(address, function (err, account) {
            if (err) {
                return cb(err);
            }
            account.getCode(_this._trie, cb);
        });
    };
    /**
     * Creates a storage trie from the primary storage trie
     * for an account and saves this in the storage cache.
     * @private
     */
    StateManager.prototype._lookupStorageTrie = function (address, cb) {
        var _this = this;
        // from state trie
        this.getAccount(address, function (err, account) {
            if (err) {
                return cb(err);
            }
            var storageTrie = _this._trie.copy();
            storageTrie.root = account.stateRoot;
            storageTrie._checkpoints = [];
            cb(null, storageTrie);
        });
    };
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    StateManager.prototype._getStorageTrie = function (address, cb) {
        var storageTrie = this._storageTries[address.toString('hex')];
        // from storage cache
        if (storageTrie) {
            return cb(null, storageTrie);
        }
        // lookup from state
        this._lookupStorageTrie(address, cb);
    };
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
    StateManager.prototype.getContractStorage = function (address, key, cb) {
        if (key.length !== 32) {
            return cb(new Error('Storage key must be 32 bytes long'));
        }
        this._getStorageTrie(address, function (err, trie) {
            if (err) {
                return cb(err);
            }
            trie.get(key, function (err, value) {
                if (err) {
                    return cb(err);
                }
                var decoded = rlp_1.decode(value);
                cb(null, decoded);
            });
        });
    };
    /**
     * Caches the storage value associated with the provided `address` and `key`
     * on first invocation, and returns the cached (original) value from then
     * onwards. This is used to get the original value of a storage slot for
     * computing gas costs according to EIP-1283.
     * @param address - Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     */
    StateManager.prototype.getOriginalContractStorage = function (address, key, cb) {
        if (key.length !== 32) {
            return cb(new Error('Storage key must be 32 bytes long'));
        }
        var addressHex = address.toString('hex');
        var keyHex = key.toString('hex');
        var map;
        if (!this._originalStorageCache.has(addressHex)) {
            map = new Map();
            this._originalStorageCache.set(addressHex, map);
        }
        else {
            map = this._originalStorageCache.get(addressHex);
        }
        if (map.has(keyHex)) {
            cb(null, map.get(keyHex));
        }
        else {
            this.getContractStorage(address, key, function (err, current) {
                if (err)
                    return cb(err);
                map.set(keyHex, current);
                cb(null, current);
            });
        }
    };
    /**
     * Modifies the storage trie of an account
     * @private
     * @param address -  Address of the account whose storage is to be modified
     * @param modifyTrie - Function to modify the storage trie of the account
     */
    StateManager.prototype._modifyContractStorage = function (address, modifyTrie, cb) {
        var _this = this;
        this._getStorageTrie(address, function (err, storageTrie) {
            if (err) {
                return cb(err);
            }
            modifyTrie(storageTrie, function (err) {
                if (err)
                    return cb(err);
                // update storage cache
                _this._storageTries[address.toString('hex')] = storageTrie;
                // update contract stateRoot
                var contract = _this._cache.get(address);
                contract.stateRoot = storageTrie.root;
                _this.putAccount(address, contract, cb);
                _this.touchAccount(address);
            });
        });
    };
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`
     * @param cb - Callback function
     */
    StateManager.prototype.putContractStorage = function (address, key, value, cb) {
        if (key.length !== 32) {
            return cb(new Error('Storage key must be 32 bytes long'));
        }
        this._modifyContractStorage(address, function (storageTrie, done) {
            if (value && value.length) {
                // format input
                var encodedValue = rlp_1.encode(value);
                storageTrie.put(key, encodedValue, done);
            }
            else {
                // deleting a value
                storageTrie.del(key, done);
            }
        }, cb);
    };
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     * @param cb - Callback function
     */
    StateManager.prototype.clearContractStorage = function (address, cb) {
        this._modifyContractStorage(address, function (storageTrie, done) {
            storageTrie.root = storageTrie.EMPTY_TRIE_ROOT;
            done();
        }, cb);
    };
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     * @param cb - Callback function
     */
    StateManager.prototype.checkpoint = function (cb) {
        this._trie.checkpoint();
        this._cache.checkpoint();
        this._touchedStack.push(new Set(Array.from(this._touched)));
        this._checkpointCount++;
        cb();
    };
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     * @param cb - Callback function
     */
    StateManager.prototype.commit = function (cb) {
        var _this = this;
        // setup trie checkpointing
        this._trie.commit(function () {
            // setup cache checkpointing
            _this._cache.commit();
            _this._touchedStack.pop();
            _this._checkpointCount--;
            if (_this._checkpointCount === 0)
                _this._cache.flush(cb);
            else
                cb();
        });
    };
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     * @param cb - Callback function
     */
    StateManager.prototype.revert = function (cb) {
        // setup trie checkpointing
        this._trie.revert();
        // setup cache checkpointing
        this._cache.revert();
        this._storageTries = {};
        var touched = this._touchedStack.pop();
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
        if (this._checkpointCount === 0)
            this._cache.flush(cb);
        else
            cb();
    };
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
    StateManager.prototype.getStateRoot = function (cb) {
        var _this = this;
        if (this._checkpointCount !== 0) {
            return cb(new Error('Cannot get state root with uncommitted checkpoints'));
        }
        this._cache.flush(function (err) {
            if (err) {
                return cb(err);
            }
            var stateRoot = _this._trie.root;
            cb(null, stateRoot);
        });
    };
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @param stateRoot - The state-root to reset the instance to
     * @param cb - Callback function
     */
    StateManager.prototype.setStateRoot = function (stateRoot, cb) {
        var _this = this;
        if (this._checkpointCount !== 0) {
            return cb(new Error('Cannot set state root with uncommitted checkpoints'));
        }
        this._cache.flush(function (err) {
            if (err) {
                return cb(err);
            }
            if (stateRoot === _this._trie.EMPTY_TRIE_ROOT) {
                _this._trie.root = stateRoot;
                _this._cache.clear();
                _this._storageTries = {};
                return cb();
            }
            _this._trie.checkRoot(stateRoot, function (err, hasRoot) {
                if (err || !hasRoot) {
                    cb(err || new Error('State trie does not contain state root'));
                }
                else {
                    _this._trie.root = stateRoot;
                    _this._cache.clear();
                    _this._storageTries = {};
                    cb();
                }
            });
        });
    };
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
    StateManager.prototype.dumpStorage = function (address, cb) {
        this._getStorageTrie(address, function (err, trie) {
            if (err) {
                return cb(err);
            }
            var storage = {};
            var stream = trie.createReadStream();
            stream.on('data', function (val) {
                storage[val.key.toString('hex')] = val.value.toString('hex');
            });
            stream.on('end', function () {
                cb(storage);
            });
        });
    };
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
    StateManager.prototype.hasGenesisState = function (cb) {
        var root = this._common.genesis().stateRoot;
        this._trie.checkRoot(root, cb);
    };
    /**
     * Generates a canonical genesis state on the instance based on the
     * configured chain parameters. Will error if there are uncommitted
     * checkpoints on the instance.
     * @param cb - Callback function
     */
    StateManager.prototype.generateCanonicalGenesis = function (cb) {
        var _this = this;
        if (this._checkpointCount !== 0) {
            return cb(new Error('Cannot create genesis state with uncommitted checkpoints'));
        }
        this.hasGenesisState(function (err, genesis) {
            if (!genesis && !err) {
                _this.generateGenesis(genesisStates_1.genesisStateByName(_this._common.chainName()), cb);
            }
            else {
                cb(err);
            }
        });
    };
    /**
     * Initializes the provided genesis state into the state trie
     * @param initState - Object (address -> balance)
     * @param cb - Callback function
     */
    StateManager.prototype.generateGenesis = function (initState, cb) {
        var _this = this;
        if (this._checkpointCount !== 0) {
            return cb(new Error('Cannot create genesis state with uncommitted checkpoints'));
        }
        var addresses = Object.keys(initState);
        asyncLib.eachSeries(addresses, function (address, done) {
            var account = new ethereumjs_account_1.default();
            if (initState[address].slice(0, 2) === '0x') {
                account.balance = new BN(initState[address].slice(2), 16).toArrayLike(Buffer);
            }
            else {
                account.balance = new BN(initState[address]).toArrayLike(Buffer);
            }
            var addressBuffer = utils.toBuffer(address);
            _this._trie.put(addressBuffer, account.serialize(), done);
        }, cb);
    };
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
    StateManager.prototype.accountIsEmpty = function (address, cb) {
        this.getAccount.bind(this)(address, function (err, account) {
            if (err) {
                return cb(err);
            }
            // should be replaced by account.isEmpty() once updated
            cb(null, account.nonce.toString('hex') === '' &&
                account.balance.toString('hex') === '' &&
                account.codeHash.toString('hex') === utils.KECCAK256_NULL_S);
        });
    };
    /**
     * Removes accounts form the state trie that have been touched,
     * as defined in EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     * @param cb - Callback function
     */
    StateManager.prototype.cleanupTouchedAccounts = function (cb) {
        var _this = this;
        var touchedArray = Array.from(this._touched);
        asyncLib.forEach(touchedArray, function (addressHex, next) {
            var address = Buffer.from(addressHex, 'hex');
            _this.accountIsEmpty(address, function (err, empty) {
                if (err) {
                    next(err);
                    return;
                }
                if (empty) {
                    _this._cache.del(address);
                }
                next(null);
            });
        }, function () {
            _this._touched.clear();
            cb();
        });
    };
    /**
     * Clears the original storage cache. Refer to [[getOriginalContractStorage]]
     * for more explanation.
     * @ignore
     */
    StateManager.prototype._clearOriginalStorageCache = function () {
        this._originalStorageCache = new Map();
    };
    return StateManager;
}());
exports.default = StateManager;
//# sourceMappingURL=stateManager.js.map
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Set = require('core-js-pure/es/set');
var debug_1 = require("debug");
var merkle_patricia_tree_1 = require("merkle-patricia-tree");
var ethereumjs_util_1 = require("ethereumjs-util");
var common_1 = __importStar(require("@ethereumjs/common"));
var cache_1 = __importDefault(require("./cache"));
var precompiles_1 = require("../evm/precompiles");
var opcodes_1 = require("../evm/opcodes");
var debug = (0, debug_1.debug)('vm:state');
/**
 * Interface for getting and setting data from an underlying
 * state trie.
 */
var DefaultStateManager = /** @class */ (function () {
    /**
     * Instantiate the StateManager interface.
     */
    function DefaultStateManager(opts) {
        if (opts === void 0) { opts = {}; }
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
        var common = opts.common;
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
    DefaultStateManager.prototype.copy = function () {
        return new DefaultStateManager({
            trie: this._trie.copy(false),
            common: this._common,
        });
    };
    /**
     * Gets the account associated with `address`. Returns an empty account if the account does not exist.
     * @param address - Address of the `account` to get
     */
    DefaultStateManager.prototype.getAccount = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._cache.getOrLoad(address)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, account];
                }
            });
        });
    };
    /**
     * Saves an account into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The account to store
     */
    DefaultStateManager.prototype.putAccount = function (address, account) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.DEBUG) {
                    debug("Save account address=" + address + " nonce=" + account.nonce + " balance=" + account.balance + " contract=" + (account.isContract() ? 'yes' : 'no') + " empty=" + (account.isEmpty() ? 'yes' : 'no'));
                }
                this._cache.put(address, account);
                this.touchAccount(address);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Deletes an account from state under the provided `address`. The account will also be removed from the state trie.
     * @param address - Address of the account which should be deleted
     */
    DefaultStateManager.prototype.deleteAccount = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.DEBUG) {
                    debug("Delete account " + address);
                }
                this._cache.del(address);
                this.touchAccount(address);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Marks an account as touched, according to the definition
     * in [EIP-158](https://eips.ethereum.org/EIPS/eip-158).
     * This happens when the account is triggered for a state-changing
     * event. Touched accounts that are empty will be cleared
     * at the end of the tx.
     */
    DefaultStateManager.prototype.touchAccount = function (address) {
        this._touched.add(address.buf.toString('hex'));
    };
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     */
    DefaultStateManager.prototype.putContractCode = function (address, value) {
        return __awaiter(this, void 0, void 0, function () {
            var codeHash, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        codeHash = (0, ethereumjs_util_1.keccak256)(value);
                        if (codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this._trie.db.put(codeHash, value)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getAccount(address)];
                    case 2:
                        account = _a.sent();
                        if (this.DEBUG) {
                            debug("Update codeHash (-> " + (0, opcodes_1.short)(codeHash) + ") for account " + address);
                        }
                        account.codeHash = codeHash;
                        return [4 /*yield*/, this.putAccount(address, account)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Buffer>} -  Resolves with the code corresponding to the provided address.
     * Returns an empty `Buffer` if the account has no associated code.
     */
    DefaultStateManager.prototype.getContractCode = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(address)];
                    case 1:
                        account = _a.sent();
                        if (!account.isContract()) {
                            return [2 /*return*/, Buffer.alloc(0)];
                        }
                        return [4 /*yield*/, this._trie.db.get(account.codeHash)];
                    case 2:
                        code = _a.sent();
                        return [2 /*return*/, code !== null && code !== void 0 ? code : Buffer.alloc(0)];
                }
            });
        });
    };
    /**
     * Creates a storage trie from the primary storage trie
     * for an account and saves this in the storage cache.
     * @private
     */
    DefaultStateManager.prototype._lookupStorageTrie = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account, storageTrie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(address)];
                    case 1:
                        account = _a.sent();
                        storageTrie = this._trie.copy(false);
                        storageTrie.root = account.stateRoot;
                        storageTrie.db.checkpoints = [];
                        return [2 /*return*/, storageTrie];
                }
            });
        });
    };
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    DefaultStateManager.prototype._getStorageTrie = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var addressHex, storageTrie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addressHex = address.buf.toString('hex');
                        storageTrie = this._storageTries[addressHex];
                        if (!!storageTrie) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._lookupStorageTrie(address)];
                    case 1:
                        // lookup from state
                        storageTrie = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, storageTrie];
                }
            });
        });
    };
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Promise<Buffer>} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Buffer` is returned.
     */
    DefaultStateManager.prototype.getContractStorage = function (address, key) {
        return __awaiter(this, void 0, void 0, function () {
            var trie, value, decoded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (key.length !== 32) {
                            throw new Error('Storage key must be 32 bytes long');
                        }
                        return [4 /*yield*/, this._getStorageTrie(address)];
                    case 1:
                        trie = _a.sent();
                        return [4 /*yield*/, trie.get(key)];
                    case 2:
                        value = _a.sent();
                        decoded = ethereumjs_util_1.rlp.decode(value);
                        return [2 /*return*/, decoded];
                }
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
    DefaultStateManager.prototype.getOriginalContractStorage = function (address, key) {
        return __awaiter(this, void 0, void 0, function () {
            var addressHex, keyHex, map, current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (key.length !== 32) {
                            throw new Error('Storage key must be 32 bytes long');
                        }
                        addressHex = address.buf.toString('hex');
                        keyHex = key.toString('hex');
                        if (!this._originalStorageCache.has(addressHex)) {
                            map = new Map();
                            this._originalStorageCache.set(addressHex, map);
                        }
                        else {
                            map = this._originalStorageCache.get(addressHex);
                        }
                        if (!map.has(keyHex)) return [3 /*break*/, 1];
                        return [2 /*return*/, map.get(keyHex)];
                    case 1: return [4 /*yield*/, this.getContractStorage(address, key)];
                    case 2:
                        current = _a.sent();
                        map.set(keyHex, current);
                        return [2 /*return*/, current];
                }
            });
        });
    };
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation.
     */
    DefaultStateManager.prototype._clearOriginalStorageCache = function () {
        this._originalStorageCache = new Map();
    };
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation. Alias of the internal {@link StateManager._clearOriginalStorageCache}
     */
    DefaultStateManager.prototype.clearOriginalStorageCache = function () {
        this._clearOriginalStorageCache();
    };
    /**
     * Modifies the storage trie of an account.
     * @private
     * @param address -  Address of the account whose storage is to be modified
     * @param modifyTrie - Function to modify the storage trie of the account
     */
    DefaultStateManager.prototype._modifyContractStorage = function (address, modifyTrie) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // eslint-disable-next-line no-async-promise-executor
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var storageTrie;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this._getStorageTrie(address)];
                                case 1:
                                    storageTrie = _a.sent();
                                    modifyTrie(storageTrie, function () { return __awaiter(_this, void 0, void 0, function () {
                                        var addressHex, contract;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    addressHex = address.buf.toString('hex');
                                                    this._storageTries[addressHex] = storageTrie;
                                                    contract = this._cache.get(address);
                                                    contract.stateRoot = storageTrie.root;
                                                    return [4 /*yield*/, this.putAccount(address, contract)];
                                                case 1:
                                                    _a.sent();
                                                    this.touchAccount(address);
                                                    resolve();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`. Cannot be more than 32 bytes. Leading zeros are stripped. If it is a empty or filled with zeros, deletes the value.
     */
    DefaultStateManager.prototype.putContractStorage = function (address, key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (key.length !== 32) {
                            throw new Error('Storage key must be 32 bytes long');
                        }
                        if (value.length > 32) {
                            throw new Error('Storage value cannot be longer than 32 bytes');
                        }
                        value = (0, ethereumjs_util_1.unpadBuffer)(value);
                        return [4 /*yield*/, this._modifyContractStorage(address, function (storageTrie, done) { return __awaiter(_this, void 0, void 0, function () {
                                var encodedValue;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(value && value.length)) return [3 /*break*/, 2];
                                            encodedValue = ethereumjs_util_1.rlp.encode(value);
                                            if (this.DEBUG) {
                                                debug("Update contract storage for account " + address + " to " + (0, opcodes_1.short)(value));
                                            }
                                            return [4 /*yield*/, storageTrie.put(key, encodedValue)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2:
                                            // deleting a value
                                            if (this.DEBUG) {
                                                debug("Delete contract storage for account");
                                            }
                                            return [4 /*yield*/, storageTrie.del(key)];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            done();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     */
    DefaultStateManager.prototype.clearContractStorage = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._modifyContractStorage(address, function (storageTrie, done) {
                            storageTrie.root = storageTrie.EMPTY_TRIE_ROOT;
                            done();
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     */
    DefaultStateManager.prototype.checkpoint = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._trie.checkpoint();
                this._cache.checkpoint();
                this._touchedStack.push(new Set(Array.from(this._touched)));
                this._accessedStorage.push(new Map());
                this._checkpointCount++;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Merges a storage map into the last item of the accessed storage stack
     */
    DefaultStateManager.prototype._accessedStorageMerge = function (storageList, storageMap) {
        var mapTarget = storageList[storageList.length - 1];
        if (mapTarget) {
            // Note: storageMap is always defined here per definition (TypeScript cannot infer this)
            storageMap === null || storageMap === void 0 ? void 0 : storageMap.forEach(function (slotSet, addressString) {
                var addressExists = mapTarget.get(addressString);
                if (!addressExists) {
                    mapTarget.set(addressString, new Set());
                }
                var storageSet = mapTarget.get(addressString);
                slotSet.forEach(function (value) {
                    storageSet.add(value);
                });
            });
        }
    };
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     */
    DefaultStateManager.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storageMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // setup trie checkpointing
                    return [4 /*yield*/, this._trie.commit()
                        // setup cache checkpointing
                    ];
                    case 1:
                        // setup trie checkpointing
                        _a.sent();
                        // setup cache checkpointing
                        this._cache.commit();
                        this._touchedStack.pop();
                        this._checkpointCount--;
                        storageMap = this._accessedStorage.pop();
                        if (storageMap) {
                            this._accessedStorageMerge(this._accessedStorage, storageMap);
                        }
                        if (!(this._checkpointCount === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._cache.flush()];
                    case 2:
                        _a.sent();
                        this._clearOriginalStorageCache();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     */
    DefaultStateManager.prototype.revert = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastItem, touched;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // setup trie checkpointing
                    return [4 /*yield*/, this._trie.revert()
                        // setup cache checkpointing
                    ];
                    case 1:
                        // setup trie checkpointing
                        _a.sent();
                        // setup cache checkpointing
                        this._cache.revert();
                        this._storageTries = {};
                        lastItem = this._accessedStorage.pop();
                        if (lastItem) {
                            this._accessedStorageReverted.push(lastItem);
                        }
                        touched = this._touchedStack.pop();
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
                        if (!(this._checkpointCount === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._cache.flush()];
                    case 2:
                        _a.sent();
                        this._clearOriginalStorageCache();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the state-root of the Merkle-Patricia trie representation
     * of the state of this StateManager. Will error if there are uncommitted
     * checkpoints on the instance.
     * @returns {Promise<Buffer>} - Returns the state-root of the `StateManager`
     */
    DefaultStateManager.prototype.getStateRoot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stateRoot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._cache.flush()];
                    case 1:
                        _a.sent();
                        stateRoot = this._trie.root;
                        return [2 /*return*/, stateRoot];
                }
            });
        });
    };
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @param stateRoot - The state-root to reset the instance to
     */
    DefaultStateManager.prototype.setStateRoot = function (stateRoot) {
        return __awaiter(this, void 0, void 0, function () {
            var hasRoot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._checkpointCount !== 0) {
                            throw new Error('Cannot set state root with uncommitted checkpoints');
                        }
                        return [4 /*yield*/, this._cache.flush()];
                    case 1:
                        _a.sent();
                        if (!!stateRoot.equals(this._trie.EMPTY_TRIE_ROOT)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._trie.checkRoot(stateRoot)];
                    case 2:
                        hasRoot = _a.sent();
                        if (!hasRoot) {
                            throw new Error('State trie does not contain state root');
                        }
                        _a.label = 3;
                    case 3:
                        this._trie.root = stateRoot;
                        this._cache.clear();
                        this._storageTries = {};
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    DefaultStateManager.prototype.dumpStorage = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._getStorageTrie(address)
                            .then(function (trie) {
                            var storage = {};
                            var stream = trie.createReadStream();
                            stream.on('data', function (val) {
                                storage[val.key.toString('hex')] = val.value.toString('hex');
                            });
                            stream.on('end', function () {
                                resolve(storage);
                            });
                        })
                            .catch(function (e) {
                            reject(e);
                        });
                    })];
            });
        });
    };
    /**
     * Checks whether the current instance has the canonical genesis state
     * for the configured chain parameters.
     * @returns {Promise<boolean>} - Whether the storage trie contains the
     * canonical genesis state for the configured chain parameters.
     */
    DefaultStateManager.prototype.hasGenesisState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var root;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        root = this._common.genesis().stateRoot;
                        return [4 /*yield*/, this._trie.checkRoot((0, ethereumjs_util_1.toBuffer)(root))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Generates a canonical genesis state on the instance based on the
     * configured chain parameters. Will error if there are uncommitted
     * checkpoints on the instance.
     */
    DefaultStateManager.prototype.generateCanonicalGenesis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var genesis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._checkpointCount !== 0) {
                            throw new Error('Cannot create genesis state with uncommitted checkpoints');
                        }
                        return [4 /*yield*/, this.hasGenesisState()];
                    case 1:
                        genesis = _a.sent();
                        if (!!genesis) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generateGenesis(this._common.genesisState())];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initializes the provided genesis state into the state trie
     * @param initState address -> balance | [balance, code, storage]
     */
    DefaultStateManager.prototype.generateGenesis = function (initState) {
        return __awaiter(this, void 0, void 0, function () {
            var addresses, addresses_1, addresses_1_1, address, addr, state, account, _a, balance, code, storage, account, _b, _c, _d, key, value, e_1_1, e_2_1;
            var e_2, _e, e_1, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (this._checkpointCount !== 0) {
                            throw new Error('Cannot create genesis state with uncommitted checkpoints');
                        }
                        if (this.DEBUG) {
                            debug("Save genesis state into the state trie");
                        }
                        addresses = Object.keys(initState);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 17, 18, 19]);
                        addresses_1 = __values(addresses), addresses_1_1 = addresses_1.next();
                        _g.label = 2;
                    case 2:
                        if (!!addresses_1_1.done) return [3 /*break*/, 16];
                        address = addresses_1_1.value;
                        addr = ethereumjs_util_1.Address.fromString(address);
                        state = initState[address];
                        if (!!Array.isArray(state)) return [3 /*break*/, 4];
                        account = ethereumjs_util_1.Account.fromAccountData({ balance: state });
                        return [4 /*yield*/, this._trie.put(addr.buf, account.serialize())];
                    case 3:
                        _g.sent();
                        return [3 /*break*/, 15];
                    case 4:
                        _a = __read(state, 3), balance = _a[0], code = _a[1], storage = _a[2];
                        account = ethereumjs_util_1.Account.fromAccountData({ balance: balance });
                        return [4 /*yield*/, this._trie.put(addr.buf, account.serialize())];
                    case 5:
                        _g.sent();
                        if (!code) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.putContractCode(addr, (0, ethereumjs_util_1.toBuffer)(code))];
                    case 6:
                        _g.sent();
                        _g.label = 7;
                    case 7:
                        if (!storage) return [3 /*break*/, 15];
                        _g.label = 8;
                    case 8:
                        _g.trys.push([8, 13, 14, 15]);
                        _b = (e_1 = void 0, __values(Object.values(storage))), _c = _b.next();
                        _g.label = 9;
                    case 9:
                        if (!!_c.done) return [3 /*break*/, 12];
                        _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                        return [4 /*yield*/, this.putContractStorage(addr, (0, ethereumjs_util_1.toBuffer)(key), (0, ethereumjs_util_1.toBuffer)(value))];
                    case 10:
                        _g.sent();
                        _g.label = 11;
                    case 11:
                        _c = _b.next();
                        return [3 /*break*/, 9];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (_c && !_c.done && (_f = _b.return)) _f.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 15:
                        addresses_1_1 = addresses_1.next();
                        return [3 /*break*/, 2];
                    case 16: return [3 /*break*/, 19];
                    case 17:
                        e_2_1 = _g.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 19];
                    case 18:
                        try {
                            if (addresses_1_1 && !addresses_1_1.done && (_e = addresses_1.return)) _e.call(addresses_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if the `account` corresponding to `address`
     * is empty or non-existent as defined in
     * EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     * @param address - Address to check
     */
    DefaultStateManager.prototype.accountIsEmpty = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(address)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, account.isEmpty()];
                }
            });
        });
    };
    /**
     * Checks if the `account` corresponding to `address`
     * exists
     * @param address - Address of the `account` to check
     */
    DefaultStateManager.prototype.accountExists = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = this._cache.lookup(address);
                        if (account && !account.virtual && !this._cache.keyIsDeleted(address)) {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this._cache._trie.get(address.buf)];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /** EIP-2929 logic
     * This should only be called from within the EVM
     */
    /**
     * Returns true if the address is warm in the current context
     * @param address - The address (as a Buffer) to check
     */
    DefaultStateManager.prototype.isWarmedAddress = function (address) {
        for (var i = this._accessedStorage.length - 1; i >= 0; i--) {
            var currentMap = this._accessedStorage[i];
            if (currentMap.has(address.toString('hex'))) {
                return true;
            }
        }
        return false;
    };
    /**
     * Add a warm address in the current context
     * @param address - The address (as a Buffer) to check
     */
    DefaultStateManager.prototype.addWarmedAddress = function (address) {
        var key = address.toString('hex');
        var storageSet = this._accessedStorage[this._accessedStorage.length - 1].get(key);
        if (!storageSet) {
            var emptyStorage = new Set();
            this._accessedStorage[this._accessedStorage.length - 1].set(key, emptyStorage);
        }
    };
    /**
     * Returns true if the slot of the address is warm
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    DefaultStateManager.prototype.isWarmedStorage = function (address, slot) {
        var addressKey = address.toString('hex');
        var storageKey = slot.toString('hex');
        for (var i = this._accessedStorage.length - 1; i >= 0; i--) {
            var currentMap = this._accessedStorage[i];
            if (currentMap.has(addressKey) && currentMap.get(addressKey).has(storageKey)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Mark the storage slot in the address as warm in the current context
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    DefaultStateManager.prototype.addWarmedStorage = function (address, slot) {
        var addressKey = address.toString('hex');
        var storageSet = this._accessedStorage[this._accessedStorage.length - 1].get(addressKey);
        if (!storageSet) {
            storageSet = new Set();
            this._accessedStorage[this._accessedStorage.length - 1].set(addressKey, storageSet);
        }
        storageSet.add(slot.toString('hex'));
    };
    /**
     * Clear the warm accounts and storage. To be called after a transaction finished.
     * @param boolean - If true, returns an EIP-2930 access list generated
     */
    DefaultStateManager.prototype.clearWarmedAccounts = function () {
        this._accessedStorage = [new Map()];
        this._accessedStorageReverted = [new Map()];
    };
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
    DefaultStateManager.prototype.generateAccessList = function (addressesRemoved, addressesOnlyStorage) {
        var _this = this;
        if (addressesRemoved === void 0) { addressesRemoved = []; }
        if (addressesOnlyStorage === void 0) { addressesOnlyStorage = []; }
        // Merge with the reverted storage list
        var mergedStorage = __spreadArray(__spreadArray([], __read(this._accessedStorage), false), __read(this._accessedStorageReverted), false);
        // Fold merged storage array into one Map
        while (mergedStorage.length >= 2) {
            var storageMap = mergedStorage.pop();
            if (storageMap) {
                this._accessedStorageMerge(mergedStorage, storageMap);
            }
        }
        var folded = new Map(__spreadArray([], __read(mergedStorage[0].entries()), false).sort());
        // Transfer folded map to final structure
        var accessList = [];
        folded.forEach(function (slots, addressStr) {
            var address = ethereumjs_util_1.Address.fromString("0x" + addressStr);
            var check1 = (0, precompiles_1.getActivePrecompiles)(_this._common).find(function (a) { return a.equals(address); });
            var check2 = addressesRemoved.find(function (a) { return a.equals(address); });
            var check3 = addressesOnlyStorage.find(function (a) { return a.equals(address); }) !== undefined && slots.size === 0;
            if (!check1 && !check2 && !check3) {
                var storageSlots = Array.from(slots)
                    .map(function (s) { return "0x" + s; })
                    .sort();
                var accessListItem = {
                    address: "0x" + addressStr,
                    storageKeys: storageSlots,
                };
                accessList.push(accessListItem);
            }
        });
        return accessList;
    };
    /**
     * Removes accounts form the state trie that have been touched,
     * as defined in EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     */
    DefaultStateManager.prototype.cleanupTouchedAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var touchedArray, touchedArray_1, touchedArray_1_1, addressHex, address, empty, e_3_1;
            var e_3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._common.gteHardfork('spuriousDragon')) return [3 /*break*/, 8];
                        touchedArray = Array.from(this._touched);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        touchedArray_1 = __values(touchedArray), touchedArray_1_1 = touchedArray_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!touchedArray_1_1.done) return [3 /*break*/, 5];
                        addressHex = touchedArray_1_1.value;
                        address = new ethereumjs_util_1.Address(Buffer.from(addressHex, 'hex'));
                        return [4 /*yield*/, this.accountIsEmpty(address)];
                    case 3:
                        empty = _b.sent();
                        if (empty) {
                            this._cache.del(address);
                            if (this.DEBUG) {
                                debug("Cleanup touched account address=" + address + " (>= SpuriousDragon)");
                            }
                        }
                        _b.label = 4;
                    case 4:
                        touchedArray_1_1 = touchedArray_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_3_1 = _b.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (touchedArray_1_1 && !touchedArray_1_1.done && (_a = touchedArray_1.return)) _a.call(touchedArray_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        this._touched.clear();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DefaultStateManager;
}());
exports.default = DefaultStateManager;
//# sourceMappingURL=stateManager.js.map
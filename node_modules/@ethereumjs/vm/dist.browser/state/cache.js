"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var Tree = require('functional-red-black-tree');
/**
 * @ignore
 */
var Cache = /** @class */ (function () {
    function Cache(trie) {
        this._cache = Tree();
        this._checkpoints = [];
        this._trie = trie;
    }
    /**
     * Puts account to cache under its address.
     * @param key - Address of account
     * @param val - Account
     */
    Cache.prototype.put = function (key, val, fromTrie) {
        if (fromTrie === void 0) { fromTrie = false; }
        var modified = !fromTrie;
        this._update(key, val, modified, false);
    };
    /**
     * Returns the queried account or an empty account.
     * @param key - Address of account
     */
    Cache.prototype.get = function (key) {
        var account = this.lookup(key);
        return account !== null && account !== void 0 ? account : new ethereumjs_util_1.Account();
    };
    /**
     * Returns the queried account or undefined.
     * @param key - Address of account
     */
    Cache.prototype.lookup = function (key) {
        var keyStr = key.buf.toString('hex');
        var it = this._cache.find(keyStr);
        if (it.node) {
            var rlp = it.value.val;
            var account = ethereumjs_util_1.Account.fromRlpSerializedAccount(rlp);
            account.virtual = it.value.virtual;
            return account;
        }
    };
    /**
     * Returns true if the key was deleted and thus existed in the cache earlier
     * @param key - trie key to lookup
     */
    Cache.prototype.keyIsDeleted = function (key) {
        var keyStr = key.buf.toString('hex');
        var it = this._cache.find(keyStr);
        if (it.node) {
            return it.value.deleted;
        }
        return false;
    };
    /**
     * Looks up address in underlying trie.
     * @param address - Address of account
     */
    Cache.prototype._lookupAccount = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var rlp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._trie.get(address.buf)];
                    case 1:
                        rlp = _a.sent();
                        return [2 /*return*/, rlp ? ethereumjs_util_1.Account.fromRlpSerializedAccount(rlp) : undefined];
                }
            });
        });
    };
    /**
     * Looks up address in cache, if not found, looks it up
     * in the underlying trie.
     * @param key - Address of account
     */
    Cache.prototype.getOrLoad = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = this.lookup(address);
                        if (!!account) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._lookupAccount(address)];
                    case 1:
                        account = _a.sent();
                        if (account) {
                            this._update(address, account, false, false, false);
                        }
                        else {
                            account = new ethereumjs_util_1.Account();
                            account.virtual = true;
                            this._update(address, account, false, false, true);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, account];
                }
            });
        });
    };
    /**
     * Warms cache by loading their respective account from trie
     * and putting them in cache.
     * @param addresses - Array of addresses
     */
    Cache.prototype.warm = function (addresses) {
        return __awaiter(this, void 0, void 0, function () {
            var addresses_1, addresses_1_1, addressHex, address, account, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        addresses_1 = __values(addresses), addresses_1_1 = addresses_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!addresses_1_1.done) return [3 /*break*/, 4];
                        addressHex = addresses_1_1.value;
                        if (!addressHex) return [3 /*break*/, 3];
                        address = new ethereumjs_util_1.Address(Buffer.from(addressHex, 'hex'));
                        return [4 /*yield*/, this._lookupAccount(address)];
                    case 2:
                        account = _b.sent();
                        if (account) {
                            this._update(address, account, false, false, false);
                        }
                        else {
                            account = new ethereumjs_util_1.Account();
                            this._update(address, account, false, false, true);
                        }
                        _b.label = 3;
                    case 3:
                        addresses_1_1 = addresses_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (addresses_1_1 && !addresses_1_1.done && (_a = addresses_1.return)) _a.call(addresses_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Flushes cache by updating accounts that have been modified
     * and removing accounts that have been deleted.
     */
    Cache.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var it, next, accountRlp, keyBuf, keyBuf;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        it = this._cache.begin;
                        next = true;
                        _a.label = 1;
                    case 1:
                        if (!next) return [3 /*break*/, 7];
                        if (!(it.value && it.value.modified && !it.value.deleted)) return [3 /*break*/, 3];
                        it.value.modified = false;
                        accountRlp = it.value.val;
                        keyBuf = Buffer.from(it.key, 'hex');
                        return [4 /*yield*/, this._trie.put(keyBuf, accountRlp)];
                    case 2:
                        _a.sent();
                        next = it.hasNext;
                        it.next();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(it.value && it.value.modified && it.value.deleted)) return [3 /*break*/, 5];
                        it.value.modified = false;
                        it.value.deleted = true;
                        it.value.virtual = true;
                        it.value.val = new ethereumjs_util_1.Account().serialize();
                        keyBuf = Buffer.from(it.key, 'hex');
                        return [4 /*yield*/, this._trie.del(keyBuf)];
                    case 4:
                        _a.sent();
                        next = it.hasNext;
                        it.next();
                        return [3 /*break*/, 6];
                    case 5:
                        next = it.hasNext;
                        it.next();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Marks current state of cache as checkpoint, which can
     * later on be reverted or commited.
     */
    Cache.prototype.checkpoint = function () {
        this._checkpoints.push(this._cache);
    };
    /**
     * Revert changes to cache last checkpoint (no effect on trie).
     */
    Cache.prototype.revert = function () {
        this._cache = this._checkpoints.pop();
    };
    /**
     * Commits to current state of cache (no effect on trie).
     */
    Cache.prototype.commit = function () {
        this._checkpoints.pop();
    };
    /**
     * Clears cache.
     */
    Cache.prototype.clear = function () {
        this._cache = Tree();
    };
    /**
     * Marks address as deleted in cache.
     * @param key - Address
     */
    Cache.prototype.del = function (key) {
        this._update(key, new ethereumjs_util_1.Account(), true, true, true);
    };
    /**
     * Generic cache update helper function
     *
     * @param key
     * @param value
     * @param modified - Has the value been modfied or is it coming unchanged from the trie (also used for deleted accounts)
     * @param deleted - Delete operation on an account
     * @param virtual - Account doesn't exist in the underlying trie
     */
    Cache.prototype._update = function (key, value, modified, deleted, virtual) {
        if (virtual === void 0) { virtual = false; }
        var keyHex = key.buf.toString('hex');
        var it = this._cache.find(keyHex);
        var val = value.serialize();
        if (it.node) {
            this._cache = it.update({ val: val, modified: modified, deleted: deleted, virtual: virtual });
        }
        else {
            this._cache = this._cache.insert(keyHex, { val: val, modified: modified, deleted: deleted, virtual: virtual });
        }
    };
    return Cache;
}());
exports.default = Cache;
//# sourceMappingURL=cache.js.map
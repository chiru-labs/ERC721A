"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var asyncLib = require('async');
var Tree = require('functional-red-black-tree');
var ethereumjs_account_1 = require("ethereumjs-account");
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
        if (!account) {
            account = new ethereumjs_account_1.default();
        }
        return account;
    };
    /**
     * Returns the queried account or undefined.
     * @param key - Address of account
     */
    Cache.prototype.lookup = function (key) {
        var keyStr = key.toString('hex');
        var it = this._cache.find(keyStr);
        if (it.node) {
            var account = new ethereumjs_account_1.default(it.value.val);
            return account;
        }
    };
    /**
     * Looks up address in underlying trie.
     * @param address - Address of account
     * @param cb - Callback with params (err, account)
     */
    Cache.prototype._lookupAccount = function (address, cb) {
        this._trie.get(address, function (err, raw) {
            if (err)
                return cb(err);
            var account = new ethereumjs_account_1.default(raw);
            cb(null, account);
        });
    };
    /**
     * Looks up address in cache, if not found, looks it up
     * in the underlying trie.
     * @param key - Address of account
     * @param cb - Callback with params (err, account)
     */
    Cache.prototype.getOrLoad = function (key, cb) {
        var _this = this;
        var account = this.lookup(key);
        if (account) {
            asyncLib.nextTick(cb, null, account);
        }
        else {
            this._lookupAccount(key, function (err, account) {
                if (err)
                    return cb(err);
                _this._update(key, account, false, false);
                cb(null, account);
            });
        }
    };
    /**
     * Warms cache by loading their respective account from trie
     * and putting them in cache.
     * @param addresses - Array of addresses
     * @param cb - Callback
     */
    Cache.prototype.warm = function (addresses, cb) {
        var _this = this;
        // shim till async supports iterators
        var accountArr = [];
        addresses.forEach(function (val) {
            if (val)
                accountArr.push(val);
        });
        asyncLib.eachSeries(accountArr, function (addressHex, done) {
            var address = Buffer.from(addressHex, 'hex');
            _this._lookupAccount(address, function (err, account) {
                if (err)
                    return done(err);
                _this._update(address, account, false, false);
                done();
            });
        }, cb);
    };
    /**
     * Flushes cache by updating accounts that have been modified
     * and removing accounts that have been deleted.
     * @param cb - Callback
     */
    Cache.prototype.flush = function (cb) {
        var _this = this;
        var it = this._cache.begin;
        var next = true;
        asyncLib.whilst(function () { return next; }, function (done) {
            if (it.value && it.value.modified) {
                it.value.modified = false;
                it.value.val = it.value.val.serialize();
                _this._trie.put(Buffer.from(it.key, 'hex'), it.value.val, function (err) {
                    if (err)
                        return done(err);
                    next = it.hasNext;
                    it.next();
                    done();
                });
            }
            else if (it.value && it.value.deleted) {
                it.value.modified = false;
                it.value.deleted = false;
                it.value.val = new ethereumjs_account_1.default().serialize();
                _this._trie.del(Buffer.from(it.key, 'hex'), function (err) {
                    if (err)
                        return done(err);
                    next = it.hasNext;
                    it.next();
                    done();
                });
            }
            else {
                next = it.hasNext;
                it.next();
                asyncLib.nextTick(done);
            }
        }, cb);
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
        this._update(key, new ethereumjs_account_1.default(), false, true);
    };
    Cache.prototype._update = function (key, val, modified, deleted) {
        var keyHex = key.toString('hex');
        var it = this._cache.find(keyHex);
        if (it.node) {
            this._cache = it.update({
                val: val,
                modified: modified,
                deleted: deleted,
            });
        }
        else {
            this._cache = this._cache.insert(keyHex, {
                val: val,
                modified: modified,
                deleted: deleted,
            });
        }
    };
    return Cache;
}());
exports.default = Cache;
//# sourceMappingURL=cache.js.map
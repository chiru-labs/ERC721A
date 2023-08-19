"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rlp = require("rlp");
var ethUtil = require('ethereumjs-util');
var Buffer = require('safe-buffer').Buffer;
var Account = /** @class */ (function () {
    function Account(data) {
        var fields = [
            {
                name: 'nonce',
                default: Buffer.alloc(0),
            },
            {
                name: 'balance',
                default: Buffer.alloc(0),
            },
            {
                name: 'stateRoot',
                length: 32,
                default: ethUtil.KECCAK256_RLP,
            },
            {
                name: 'codeHash',
                length: 32,
                default: ethUtil.KECCAK256_NULL,
            },
        ];
        ethUtil.defineProperties(this, fields, data);
    }
    Account.prototype.serialize = function () {
        return rlp.encode([this.nonce, this.balance, this.stateRoot, this.codeHash]);
    };
    Account.prototype.isContract = function () {
        return this.codeHash.toString('hex') !== ethUtil.KECCAK256_NULL_S;
    };
    Account.prototype.getCode = function (trie, cb) {
        if (!this.isContract()) {
            cb(null, Buffer.alloc(0));
            return;
        }
        trie.getRaw(this.codeHash, cb);
    };
    Account.prototype.setCode = function (trie, code, cb) {
        var _this = this;
        this.codeHash = ethUtil.keccak256(code);
        if (this.codeHash.toString('hex') === ethUtil.KECCAK256_NULL_S) {
            cb(null, Buffer.alloc(0));
            return;
        }
        trie.putRaw(this.codeHash, code, function (err) {
            cb(err, _this.codeHash);
        });
    };
    Account.prototype.getStorage = function (trie, key, cb) {
        var t = trie.copy();
        t.root = this.stateRoot;
        t.get(key, cb);
    };
    Account.prototype.setStorage = function (trie, key, val, cb) {
        var _this = this;
        var t = trie.copy();
        t.root = this.stateRoot;
        t.put(key, val, function (err) {
            if (err)
                return cb();
            _this.stateRoot = t.root;
            cb();
        });
    };
    Account.prototype.isEmpty = function () {
        return (this.balance.toString('hex') === '' &&
            this.nonce.toString('hex') === '' &&
            this.stateRoot.toString('hex') === ethUtil.KECCAK256_RLP_S &&
            this.codeHash.toString('hex') === ethUtil.KECCAK256_NULL_S);
    };
    return Account;
}());
exports.default = Account;
//# sourceMappingURL=index.js.map
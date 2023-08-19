"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var baseTransaction_1 = require("./baseTransaction");
var types_1 = require("./types");
var util_1 = require("./util");
var TRANSACTION_TYPE = 1;
var TRANSACTION_TYPE_BUFFER = Buffer.from(TRANSACTION_TYPE.toString(16).padStart(2, '0'), 'hex');
/**
 * Typed transaction with optional access lists
 *
 * - TransactionType: 1
 * - EIP: [EIP-2930](https://eips.ethereum.org/EIPS/eip-2930)
 */
var AccessListEIP2930Transaction = /** @class */ (function (_super) {
    __extends(AccessListEIP2930Transaction, _super);
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * It is not recommended to use this constructor directly. Instead use
     * the static factory methods to assist in creating a Transaction object from
     * varying data types.
     */
    function AccessListEIP2930Transaction(txData, opts) {
        if (opts === void 0) { opts = {}; }
        var _a, _b;
        var _this = _super.call(this, __assign(__assign({}, txData), { type: TRANSACTION_TYPE })) || this;
        /**
         * The default HF if the tx type is active on that HF
         * or the first greater HF where the tx is active.
         *
         * @hidden
         */
        _this.DEFAULT_HARDFORK = 'berlin';
        var chainId = txData.chainId, accessList = txData.accessList, gasPrice = txData.gasPrice;
        _this.common = _this._getCommon(opts.common, chainId);
        _this.chainId = _this.common.chainIdBN();
        // EIP-2718 check is done in Common
        if (!_this.common.isActivatedEIP(2930)) {
            throw new Error('EIP-2930 not enabled on Common');
        }
        _this.activeCapabilities = _this.activeCapabilities.concat([2718, 2930]);
        // Populate the access list fields
        var accessListData = util_1.AccessLists.getAccessListData(accessList !== null && accessList !== void 0 ? accessList : []);
        _this.accessList = accessListData.accessList;
        _this.AccessListJSON = accessListData.AccessListJSON;
        // Verify the access list format.
        util_1.AccessLists.verifyAccessList(_this.accessList);
        _this.gasPrice = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(gasPrice === '' ? '0x' : gasPrice));
        _this._validateCannotExceedMaxInteger({ gasPrice: _this.gasPrice });
        if (_this.v && !_this.v.eqn(0) && !_this.v.eqn(1)) {
            var msg = _this._errorMsg('The y-parity of the transaction should either be 0 or 1');
            throw new Error(msg);
        }
        if (_this.common.gteHardfork('homestead') && ((_a = _this.s) === null || _a === void 0 ? void 0 : _a.gt(types_1.N_DIV_2))) {
            var msg = _this._errorMsg('Invalid Signature: s-values greater than secp256k1n/2 are considered invalid');
            throw new Error(msg);
        }
        var freeze = (_b = opts === null || opts === void 0 ? void 0 : opts.freeze) !== null && _b !== void 0 ? _b : true;
        if (freeze) {
            Object.freeze(_this);
        }
        return _this;
    }
    Object.defineProperty(AccessListEIP2930Transaction.prototype, "senderR", {
        /**
         * EIP-2930 alias for `r`
         *
         * @deprecated use `r` instead
         */
        get: function () {
            return this.r;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AccessListEIP2930Transaction.prototype, "senderS", {
        /**
         * EIP-2930 alias for `s`
         *
         * @deprecated use `s` instead
         */
        get: function () {
            return this.s;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AccessListEIP2930Transaction.prototype, "yParity", {
        /**
         * EIP-2930 alias for `v`
         *
         * @deprecated use `v` instead
         */
        get: function () {
            return this.v;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Instantiate a transaction from a data dictionary.
     *
     * Format: { chainId, nonce, gasPrice, gasLimit, to, value, data, accessList,
     * v, r, s }
     *
     * Notes:
     * - `chainId` will be set automatically if not provided
     * - All parameters are optional and have some basic default values
     */
    AccessListEIP2930Transaction.fromTxData = function (txData, opts) {
        if (opts === void 0) { opts = {}; }
        return new AccessListEIP2930Transaction(txData, opts);
    };
    /**
     * Instantiate a transaction from the serialized tx.
     *
     * Format: `0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList,
     * signatureYParity (v), signatureR (r), signatureS (s)])`
     */
    AccessListEIP2930Transaction.fromSerializedTx = function (serialized, opts) {
        if (opts === void 0) { opts = {}; }
        if (!serialized.slice(0, 1).equals(TRANSACTION_TYPE_BUFFER)) {
            throw new Error("Invalid serialized tx input: not an EIP-2930 transaction (wrong tx type, expected: " + TRANSACTION_TYPE + ", received: " + serialized
                .slice(0, 1)
                .toString('hex'));
        }
        var values = ethereumjs_util_1.rlp.decode(serialized.slice(1));
        if (!Array.isArray(values)) {
            throw new Error('Invalid serialized tx input: must be array');
        }
        return AccessListEIP2930Transaction.fromValuesArray(values, opts);
    };
    /**
     * Instantiate a transaction from the serialized tx.
     * (alias of {@link AccessListEIP2930Transaction.fromSerializedTx})
     *
     * Note: This means that the Buffer should start with 0x01.
     *
     * @deprecated this constructor alias is deprecated and will be removed
     * in favor of the {@link AccessListEIP2930Transaction.fromSerializedTx} constructor
     */
    AccessListEIP2930Transaction.fromRlpSerializedTx = function (serialized, opts) {
        if (opts === void 0) { opts = {}; }
        return AccessListEIP2930Transaction.fromSerializedTx(serialized, opts);
    };
    /**
     * Create a transaction from a values array.
     *
     * Format: `[chainId, nonce, gasPrice, gasLimit, to, value, data, accessList,
     * signatureYParity (v), signatureR (r), signatureS (s)]`
     */
    AccessListEIP2930Transaction.fromValuesArray = function (values, opts) {
        if (opts === void 0) { opts = {}; }
        if (values.length !== 8 && values.length !== 11) {
            throw new Error('Invalid EIP-2930 transaction. Only expecting 8 values (for unsigned tx) or 11 values (for signed tx).');
        }
        var _a = __read(values, 11), chainId = _a[0], nonce = _a[1], gasPrice = _a[2], gasLimit = _a[3], to = _a[4], value = _a[5], data = _a[6], accessList = _a[7], v = _a[8], r = _a[9], s = _a[10];
        var emptyAccessList = [];
        return new AccessListEIP2930Transaction({
            chainId: new ethereumjs_util_1.BN(chainId),
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: to,
            value: value,
            data: data,
            accessList: accessList !== null && accessList !== void 0 ? accessList : emptyAccessList,
            v: v !== undefined ? new ethereumjs_util_1.BN(v) : undefined,
            r: r,
            s: s,
        }, opts);
    };
    /**
     * The amount of gas paid for the data in this tx
     */
    AccessListEIP2930Transaction.prototype.getDataFee = function () {
        if (this.cache.dataFee && this.cache.dataFee.hardfork === this.common.hardfork()) {
            return this.cache.dataFee.value;
        }
        var cost = _super.prototype.getDataFee.call(this);
        cost.iaddn(util_1.AccessLists.getDataFeeEIP2930(this.accessList, this.common));
        if (Object.isFrozen(this)) {
            this.cache.dataFee = {
                value: cost,
                hardfork: this.common.hardfork(),
            };
        }
        return cost;
    };
    /**
     * The up front amount that an account must have for this transaction to be valid
     */
    AccessListEIP2930Transaction.prototype.getUpfrontCost = function () {
        return this.gasLimit.mul(this.gasPrice).add(this.value);
    };
    /**
     * Returns a Buffer Array of the raw Buffers of the EIP-2930 transaction, in order.
     *
     * Format: `[chainId, nonce, gasPrice, gasLimit, to, value, data, accessList,
     * signatureYParity (v), signatureR (r), signatureS (s)]`
     *
     * Use {@link AccessListEIP2930Transaction.serialize} to add a transaction to a block
     * with {@link Block.fromValuesArray}.
     *
     * For an unsigned tx this method uses the empty Buffer values for the
     * signature parameters `v`, `r` and `s` for encoding. For an EIP-155 compliant
     * representation for external signing use {@link AccessListEIP2930Transaction.getMessageToSign}.
     */
    AccessListEIP2930Transaction.prototype.raw = function () {
        return [
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.chainId),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.nonce),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.gasPrice),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.gasLimit),
            this.to !== undefined ? this.to.buf : Buffer.from([]),
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.value),
            this.data,
            this.accessList,
            this.v !== undefined ? (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.v) : Buffer.from([]),
            this.r !== undefined ? (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.r) : Buffer.from([]),
            this.s !== undefined ? (0, ethereumjs_util_1.bnToUnpaddedBuffer)(this.s) : Buffer.from([]),
        ];
    };
    /**
     * Returns the serialized encoding of the EIP-2930 transaction.
     *
     * Format: `0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList,
     * signatureYParity (v), signatureR (r), signatureS (s)])`
     *
     * Note that in contrast to the legacy tx serialization format this is not
     * valid RLP any more due to the raw tx type preceding and concatenated to
     * the RLP encoding of the values.
     */
    AccessListEIP2930Transaction.prototype.serialize = function () {
        var base = this.raw();
        return Buffer.concat([TRANSACTION_TYPE_BUFFER, ethereumjs_util_1.rlp.encode(base)]);
    };
    /**
     * Returns the serialized unsigned tx (hashed or raw), which can be used
     * to sign the transaction (e.g. for sending to a hardware wallet).
     *
     * Note: in contrast to the legacy tx the raw message format is already
     * serialized and doesn't need to be RLP encoded any more.
     *
     * ```javascript
     * const serializedMessage = tx.getMessageToSign(false) // use this for the HW wallet input
     * ```
     *
     * @param hashMessage - Return hashed message if set to true (default: true)
     */
    AccessListEIP2930Transaction.prototype.getMessageToSign = function (hashMessage) {
        if (hashMessage === void 0) { hashMessage = true; }
        var base = this.raw().slice(0, 8);
        var message = Buffer.concat([TRANSACTION_TYPE_BUFFER, ethereumjs_util_1.rlp.encode(base)]);
        if (hashMessage) {
            return (0, ethereumjs_util_1.keccak256)(message);
        }
        else {
            return message;
        }
    };
    /**
     * Computes a sha3-256 hash of the serialized tx.
     *
     * This method can only be used for signed txs (it throws otherwise).
     * Use {@link AccessListEIP2930Transaction.getMessageToSign} to get a tx hash for the purpose of signing.
     */
    AccessListEIP2930Transaction.prototype.hash = function () {
        if (!this.isSigned()) {
            var msg = this._errorMsg('Cannot call hash method if transaction is not signed');
            throw new Error(msg);
        }
        if (Object.isFrozen(this)) {
            if (!this.cache.hash) {
                this.cache.hash = (0, ethereumjs_util_1.keccak256)(this.serialize());
            }
            return this.cache.hash;
        }
        return (0, ethereumjs_util_1.keccak256)(this.serialize());
    };
    /**
     * Computes a sha3-256 hash which can be used to verify the signature
     */
    AccessListEIP2930Transaction.prototype.getMessageToVerifySignature = function () {
        return this.getMessageToSign();
    };
    /**
     * Returns the public key of the sender
     */
    AccessListEIP2930Transaction.prototype.getSenderPublicKey = function () {
        var _a;
        if (!this.isSigned()) {
            var msg = this._errorMsg('Cannot call this method if transaction is not signed');
            throw new Error(msg);
        }
        var msgHash = this.getMessageToVerifySignature();
        // EIP-2: All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
        // Reasoning: https://ethereum.stackexchange.com/a/55728
        if (this.common.gteHardfork('homestead') && ((_a = this.s) === null || _a === void 0 ? void 0 : _a.gt(types_1.N_DIV_2))) {
            var msg = this._errorMsg('Invalid Signature: s-values greater than secp256k1n/2 are considered invalid');
            throw new Error(msg);
        }
        var _b = this, yParity = _b.yParity, r = _b.r, s = _b.s;
        try {
            return (0, ethereumjs_util_1.ecrecover)(msgHash, yParity.addn(27), // Recover the 27 which was stripped from ecsign
            (0, ethereumjs_util_1.bnToUnpaddedBuffer)(r), (0, ethereumjs_util_1.bnToUnpaddedBuffer)(s));
        }
        catch (e) {
            var msg = this._errorMsg('Invalid Signature');
            throw new Error(msg);
        }
    };
    AccessListEIP2930Transaction.prototype._processSignature = function (v, r, s) {
        var opts = {
            common: this.common,
        };
        return AccessListEIP2930Transaction.fromTxData({
            chainId: this.chainId,
            nonce: this.nonce,
            gasPrice: this.gasPrice,
            gasLimit: this.gasLimit,
            to: this.to,
            value: this.value,
            data: this.data,
            accessList: this.accessList,
            v: new ethereumjs_util_1.BN(v - 27),
            r: new ethereumjs_util_1.BN(r),
            s: new ethereumjs_util_1.BN(s),
        }, opts);
    };
    /**
     * Returns an object with the JSON representation of the transaction
     */
    AccessListEIP2930Transaction.prototype.toJSON = function () {
        var accessListJSON = util_1.AccessLists.getAccessListJSON(this.accessList);
        return {
            chainId: (0, ethereumjs_util_1.bnToHex)(this.chainId),
            nonce: (0, ethereumjs_util_1.bnToHex)(this.nonce),
            gasPrice: (0, ethereumjs_util_1.bnToHex)(this.gasPrice),
            gasLimit: (0, ethereumjs_util_1.bnToHex)(this.gasLimit),
            to: this.to !== undefined ? this.to.toString() : undefined,
            value: (0, ethereumjs_util_1.bnToHex)(this.value),
            data: '0x' + this.data.toString('hex'),
            accessList: accessListJSON,
            v: this.v !== undefined ? (0, ethereumjs_util_1.bnToHex)(this.v) : undefined,
            r: this.r !== undefined ? (0, ethereumjs_util_1.bnToHex)(this.r) : undefined,
            s: this.s !== undefined ? (0, ethereumjs_util_1.bnToHex)(this.s) : undefined,
        };
    };
    /**
     * Return a compact error string representation of the object
     */
    AccessListEIP2930Transaction.prototype.errorStr = function () {
        var _a, _b;
        var errorStr = this._getSharedErrorPostfix();
        // Keep ? for this.accessList since this otherwise causes Hardhat E2E tests to fail
        errorStr += " gasPrice=" + this.gasPrice + " accessListCount=" + ((_b = (_a = this.accessList) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
        return errorStr;
    };
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    AccessListEIP2930Transaction.prototype._errorMsg = function (msg) {
        return msg + " (" + this.errorStr() + ")";
    };
    return AccessListEIP2930Transaction;
}(baseTransaction_1.BaseTransaction));
exports.default = AccessListEIP2930Transaction;
//# sourceMappingURL=eip2930Transaction.js.map
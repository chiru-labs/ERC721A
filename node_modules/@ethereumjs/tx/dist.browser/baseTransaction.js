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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransaction = void 0;
var common_1 = __importStar(require("@ethereumjs/common"));
var ethereumjs_util_1 = require("ethereumjs-util");
var types_1 = require("./types");
/**
 * This base class will likely be subject to further
 * refactoring along the introduction of additional tx types
 * on the Ethereum network.
 *
 * It is therefore not recommended to use directly.
 */
var BaseTransaction = /** @class */ (function () {
    function BaseTransaction(txData) {
        this.cache = {
            hash: undefined,
            dataFee: undefined,
        };
        /**
         * List of tx type defining EIPs,
         * e.g. 1559 (fee market) and 2930 (access lists)
         * for FeeMarketEIP1559Transaction objects
         */
        this.activeCapabilities = [];
        /**
         * The default chain the tx falls back to if no Common
         * is provided and if the chain can't be derived from
         * a passed in chainId (only EIP-2718 typed txs) or
         * EIP-155 signature (legacy txs).
         *
         * @hidden
         */
        this.DEFAULT_CHAIN = common_1.Chain.Mainnet;
        /**
         * The default HF if the tx type is active on that HF
         * or the first greater HF where the tx is active.
         *
         * @hidden
         */
        this.DEFAULT_HARDFORK = common_1.Hardfork.Istanbul;
        var nonce = txData.nonce, gasLimit = txData.gasLimit, to = txData.to, value = txData.value, data = txData.data, v = txData.v, r = txData.r, s = txData.s, type = txData.type;
        this._type = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(type)).toNumber();
        var toB = (0, ethereumjs_util_1.toBuffer)(to === '' ? '0x' : to);
        var vB = (0, ethereumjs_util_1.toBuffer)(v === '' ? '0x' : v);
        var rB = (0, ethereumjs_util_1.toBuffer)(r === '' ? '0x' : r);
        var sB = (0, ethereumjs_util_1.toBuffer)(s === '' ? '0x' : s);
        this.nonce = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(nonce === '' ? '0x' : nonce));
        this.gasLimit = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(gasLimit === '' ? '0x' : gasLimit));
        this.to = toB.length > 0 ? new ethereumjs_util_1.Address(toB) : undefined;
        this.value = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(value === '' ? '0x' : value));
        this.data = (0, ethereumjs_util_1.toBuffer)(data === '' ? '0x' : data);
        this.v = vB.length > 0 ? new ethereumjs_util_1.BN(vB) : undefined;
        this.r = rB.length > 0 ? new ethereumjs_util_1.BN(rB) : undefined;
        this.s = sB.length > 0 ? new ethereumjs_util_1.BN(sB) : undefined;
        this._validateCannotExceedMaxInteger({
            nonce: this.nonce,
            gasLimit: this.gasLimit,
            value: this.value,
            r: this.r,
            s: this.s,
        });
    }
    Object.defineProperty(BaseTransaction.prototype, "transactionType", {
        /**
         * Alias for {@link BaseTransaction.type}
         *
         * @deprecated Use `type` instead
         */
        get: function () {
            return this.type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTransaction.prototype, "type", {
        /**
         * Returns the transaction type.
         *
         * Note: legacy txs will return tx type `0`.
         */
        get: function () {
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Checks if a tx type defining capability is active
     * on a tx, for example the EIP-1559 fee market mechanism
     * or the EIP-2930 access list feature.
     *
     * Note that this is different from the tx type itself,
     * so EIP-2930 access lists can very well be active
     * on an EIP-1559 tx for example.
     *
     * This method can be useful for feature checks if the
     * tx type is unknown (e.g. when instantiated with
     * the tx factory).
     *
     * See `Capabilites` in the `types` module for a reference
     * on all supported capabilities.
     */
    BaseTransaction.prototype.supports = function (capability) {
        return this.activeCapabilities.includes(capability);
    };
    BaseTransaction.prototype.validate = function (stringError) {
        if (stringError === void 0) { stringError = false; }
        var errors = [];
        if (this.getBaseFee().gt(this.gasLimit)) {
            errors.push("gasLimit is too low. given " + this.gasLimit + ", need at least " + this.getBaseFee());
        }
        if (this.isSigned() && !this.verifySignature()) {
            errors.push('Invalid Signature');
        }
        return stringError ? errors : errors.length === 0;
    };
    /**
     * The minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
     */
    BaseTransaction.prototype.getBaseFee = function () {
        var fee = this.getDataFee().addn(this.common.param('gasPrices', 'tx'));
        if (this.common.gteHardfork('homestead') && this.toCreationAddress()) {
            fee.iaddn(this.common.param('gasPrices', 'txCreation'));
        }
        return fee;
    };
    /**
     * The amount of gas paid for the data in this tx
     */
    BaseTransaction.prototype.getDataFee = function () {
        var txDataZero = this.common.param('gasPrices', 'txDataZero');
        var txDataNonZero = this.common.param('gasPrices', 'txDataNonZero');
        var cost = 0;
        for (var i = 0; i < this.data.length; i++) {
            this.data[i] === 0 ? (cost += txDataZero) : (cost += txDataNonZero);
        }
        return new ethereumjs_util_1.BN(cost);
    };
    /**
     * If the tx's `to` is to the creation address
     */
    BaseTransaction.prototype.toCreationAddress = function () {
        return this.to === undefined || this.to.buf.length === 0;
    };
    BaseTransaction.prototype.isSigned = function () {
        var _a = this, v = _a.v, r = _a.r, s = _a.s;
        if (this.type === 0) {
            if (!v || !r || !s) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            if (v === undefined || !r || !s) {
                return false;
            }
            else {
                return true;
            }
        }
    };
    /**
     * Determines if the signature is valid
     */
    BaseTransaction.prototype.verifySignature = function () {
        try {
            // Main signature verification is done in `getSenderPublicKey()`
            var publicKey = this.getSenderPublicKey();
            return (0, ethereumjs_util_1.unpadBuffer)(publicKey).length !== 0;
        }
        catch (e) {
            return false;
        }
    };
    /**
     * Returns the sender's address
     */
    BaseTransaction.prototype.getSenderAddress = function () {
        return new ethereumjs_util_1.Address((0, ethereumjs_util_1.publicToAddress)(this.getSenderPublicKey()));
    };
    /**
     * Signs a transaction.
     *
     * Note that the signed tx is returned as a new object,
     * use as follows:
     * ```javascript
     * const signedTx = tx.sign(privateKey)
     * ```
     */
    BaseTransaction.prototype.sign = function (privateKey) {
        if (privateKey.length !== 32) {
            var msg = this._errorMsg('Private key must be 32 bytes in length.');
            throw new Error(msg);
        }
        // Hack for the constellation that we have got a legacy tx after spuriousDragon with a non-EIP155 conforming signature
        // and want to recreate a signature (where EIP155 should be applied)
        // Leaving this hack lets the legacy.spec.ts -> sign(), verifySignature() test fail
        // 2021-06-23
        var hackApplied = false;
        if (this.type === 0 &&
            this.common.gteHardfork('spuriousDragon') &&
            !this.supports(types_1.Capability.EIP155ReplayProtection)) {
            this.activeCapabilities.push(types_1.Capability.EIP155ReplayProtection);
            hackApplied = true;
        }
        var msgHash = this.getMessageToSign(true);
        var _a = (0, ethereumjs_util_1.ecsign)(msgHash, privateKey), v = _a.v, r = _a.r, s = _a.s;
        var tx = this._processSignature(v, r, s);
        // Hack part 2
        if (hackApplied) {
            var index = this.activeCapabilities.indexOf(types_1.Capability.EIP155ReplayProtection);
            if (index > -1) {
                this.activeCapabilities.splice(index, 1);
            }
        }
        return tx;
    };
    /**
     * Does chain ID checks on common and returns a common
     * to be used on instantiation
     * @hidden
     *
     * @param common - {@link Common} instance from tx options
     * @param chainId - Chain ID from tx options (typed txs) or signature (legacy tx)
     */
    BaseTransaction.prototype._getCommon = function (common, chainId) {
        var _a;
        // Chain ID provided
        if (chainId) {
            var chainIdBN = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(chainId));
            if (common) {
                if (!common.chainIdBN().eq(chainIdBN)) {
                    var msg = this._errorMsg('The chain ID does not match the chain ID of Common');
                    throw new Error(msg);
                }
                // Common provided, chain ID does match
                // -> Return provided Common
                return common.copy();
            }
            else {
                if (common_1.default.isSupportedChainId(chainIdBN)) {
                    // No Common, chain ID supported by Common
                    // -> Instantiate Common with chain ID
                    return new common_1.default({ chain: chainIdBN, hardfork: this.DEFAULT_HARDFORK });
                }
                else {
                    // No Common, chain ID not supported by Common
                    // -> Instantiate custom Common derived from DEFAULT_CHAIN
                    return common_1.default.forCustomChain(this.DEFAULT_CHAIN, {
                        name: 'custom-chain',
                        networkId: chainIdBN,
                        chainId: chainIdBN,
                    }, this.DEFAULT_HARDFORK);
                }
            }
        }
        else {
            // No chain ID provided
            // -> return Common provided or create new default Common
            return ((_a = common === null || common === void 0 ? void 0 : common.copy()) !== null && _a !== void 0 ? _a : new common_1.default({ chain: this.DEFAULT_CHAIN, hardfork: this.DEFAULT_HARDFORK }));
        }
    };
    BaseTransaction.prototype._validateCannotExceedMaxInteger = function (values, bits) {
        var e_1, _a;
        if (bits === void 0) { bits = 53; }
        try {
            for (var _b = __values(Object.entries(values)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (bits === 53) {
                    if (value === null || value === void 0 ? void 0 : value.gt(ethereumjs_util_1.MAX_INTEGER)) {
                        var msg = this._errorMsg(key + " cannot exceed MAX_INTEGER, given " + value);
                        throw new Error(msg);
                    }
                }
                else if (bits === 256) {
                    if (value === null || value === void 0 ? void 0 : value.gte(ethereumjs_util_1.TWO_POW256)) {
                        var msg = this._errorMsg(key + " must be less than 2^256, given " + value);
                        throw new Error(msg);
                    }
                }
                else {
                    var msg = this._errorMsg('unimplemented bits value');
                    throw new Error(msg);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Returns the shared error postfix part for _error() method
     * tx type implementations.
     */
    BaseTransaction.prototype._getSharedErrorPostfix = function () {
        var hash = '';
        try {
            hash = this.isSigned() ? (0, ethereumjs_util_1.bufferToHex)(this.hash()) : 'not available (unsigned)';
        }
        catch (e) {
            hash = 'error';
        }
        var isSigned = '';
        try {
            isSigned = this.isSigned().toString();
        }
        catch (e) {
            hash = 'error';
        }
        var hf = '';
        try {
            hf = this.common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        var postfix = "tx type=" + this.type + " hash=" + hash + " nonce=" + this.nonce + " value=" + this.value + " ";
        postfix += "signed=" + isSigned + " hf=" + hf;
        return postfix;
    };
    return BaseTransaction;
}());
exports.BaseTransaction = BaseTransaction;
//# sourceMappingURL=baseTransaction.js.map
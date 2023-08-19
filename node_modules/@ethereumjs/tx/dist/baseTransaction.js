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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransaction = void 0;
const common_1 = __importStar(require("@ethereumjs/common"));
const ethereumjs_util_1 = require("ethereumjs-util");
const types_1 = require("./types");
/**
 * This base class will likely be subject to further
 * refactoring along the introduction of additional tx types
 * on the Ethereum network.
 *
 * It is therefore not recommended to use directly.
 */
class BaseTransaction {
    constructor(txData) {
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
        const { nonce, gasLimit, to, value, data, v, r, s, type } = txData;
        this._type = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(type)).toNumber();
        const toB = (0, ethereumjs_util_1.toBuffer)(to === '' ? '0x' : to);
        const vB = (0, ethereumjs_util_1.toBuffer)(v === '' ? '0x' : v);
        const rB = (0, ethereumjs_util_1.toBuffer)(r === '' ? '0x' : r);
        const sB = (0, ethereumjs_util_1.toBuffer)(s === '' ? '0x' : s);
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
    /**
     * Alias for {@link BaseTransaction.type}
     *
     * @deprecated Use `type` instead
     */
    get transactionType() {
        return this.type;
    }
    /**
     * Returns the transaction type.
     *
     * Note: legacy txs will return tx type `0`.
     */
    get type() {
        return this._type;
    }
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
    supports(capability) {
        return this.activeCapabilities.includes(capability);
    }
    validate(stringError = false) {
        const errors = [];
        if (this.getBaseFee().gt(this.gasLimit)) {
            errors.push(`gasLimit is too low. given ${this.gasLimit}, need at least ${this.getBaseFee()}`);
        }
        if (this.isSigned() && !this.verifySignature()) {
            errors.push('Invalid Signature');
        }
        return stringError ? errors : errors.length === 0;
    }
    /**
     * The minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
     */
    getBaseFee() {
        const fee = this.getDataFee().addn(this.common.param('gasPrices', 'tx'));
        if (this.common.gteHardfork('homestead') && this.toCreationAddress()) {
            fee.iaddn(this.common.param('gasPrices', 'txCreation'));
        }
        return fee;
    }
    /**
     * The amount of gas paid for the data in this tx
     */
    getDataFee() {
        const txDataZero = this.common.param('gasPrices', 'txDataZero');
        const txDataNonZero = this.common.param('gasPrices', 'txDataNonZero');
        let cost = 0;
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] === 0 ? (cost += txDataZero) : (cost += txDataNonZero);
        }
        return new ethereumjs_util_1.BN(cost);
    }
    /**
     * If the tx's `to` is to the creation address
     */
    toCreationAddress() {
        return this.to === undefined || this.to.buf.length === 0;
    }
    isSigned() {
        const { v, r, s } = this;
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
    }
    /**
     * Determines if the signature is valid
     */
    verifySignature() {
        try {
            // Main signature verification is done in `getSenderPublicKey()`
            const publicKey = this.getSenderPublicKey();
            return (0, ethereumjs_util_1.unpadBuffer)(publicKey).length !== 0;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Returns the sender's address
     */
    getSenderAddress() {
        return new ethereumjs_util_1.Address((0, ethereumjs_util_1.publicToAddress)(this.getSenderPublicKey()));
    }
    /**
     * Signs a transaction.
     *
     * Note that the signed tx is returned as a new object,
     * use as follows:
     * ```javascript
     * const signedTx = tx.sign(privateKey)
     * ```
     */
    sign(privateKey) {
        if (privateKey.length !== 32) {
            const msg = this._errorMsg('Private key must be 32 bytes in length.');
            throw new Error(msg);
        }
        // Hack for the constellation that we have got a legacy tx after spuriousDragon with a non-EIP155 conforming signature
        // and want to recreate a signature (where EIP155 should be applied)
        // Leaving this hack lets the legacy.spec.ts -> sign(), verifySignature() test fail
        // 2021-06-23
        let hackApplied = false;
        if (this.type === 0 &&
            this.common.gteHardfork('spuriousDragon') &&
            !this.supports(types_1.Capability.EIP155ReplayProtection)) {
            this.activeCapabilities.push(types_1.Capability.EIP155ReplayProtection);
            hackApplied = true;
        }
        const msgHash = this.getMessageToSign(true);
        const { v, r, s } = (0, ethereumjs_util_1.ecsign)(msgHash, privateKey);
        const tx = this._processSignature(v, r, s);
        // Hack part 2
        if (hackApplied) {
            const index = this.activeCapabilities.indexOf(types_1.Capability.EIP155ReplayProtection);
            if (index > -1) {
                this.activeCapabilities.splice(index, 1);
            }
        }
        return tx;
    }
    /**
     * Does chain ID checks on common and returns a common
     * to be used on instantiation
     * @hidden
     *
     * @param common - {@link Common} instance from tx options
     * @param chainId - Chain ID from tx options (typed txs) or signature (legacy tx)
     */
    _getCommon(common, chainId) {
        var _a;
        // Chain ID provided
        if (chainId) {
            const chainIdBN = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(chainId));
            if (common) {
                if (!common.chainIdBN().eq(chainIdBN)) {
                    const msg = this._errorMsg('The chain ID does not match the chain ID of Common');
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
    }
    _validateCannotExceedMaxInteger(values, bits = 53) {
        for (const [key, value] of Object.entries(values)) {
            if (bits === 53) {
                if (value === null || value === void 0 ? void 0 : value.gt(ethereumjs_util_1.MAX_INTEGER)) {
                    const msg = this._errorMsg(`${key} cannot exceed MAX_INTEGER, given ${value}`);
                    throw new Error(msg);
                }
            }
            else if (bits === 256) {
                if (value === null || value === void 0 ? void 0 : value.gte(ethereumjs_util_1.TWO_POW256)) {
                    const msg = this._errorMsg(`${key} must be less than 2^256, given ${value}`);
                    throw new Error(msg);
                }
            }
            else {
                const msg = this._errorMsg('unimplemented bits value');
                throw new Error(msg);
            }
        }
    }
    /**
     * Returns the shared error postfix part for _error() method
     * tx type implementations.
     */
    _getSharedErrorPostfix() {
        let hash = '';
        try {
            hash = this.isSigned() ? (0, ethereumjs_util_1.bufferToHex)(this.hash()) : 'not available (unsigned)';
        }
        catch (e) {
            hash = 'error';
        }
        let isSigned = '';
        try {
            isSigned = this.isSigned().toString();
        }
        catch (e) {
            hash = 'error';
        }
        let hf = '';
        try {
            hf = this.common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        let postfix = `tx type=${this.type} hash=${hash} nonce=${this.nonce} value=${this.value} `;
        postfix += `signed=${isSigned} hf=${hf}`;
        return postfix;
    }
}
exports.BaseTransaction = BaseTransaction;
//# sourceMappingURL=baseTransaction.js.map
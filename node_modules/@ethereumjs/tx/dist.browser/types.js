"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N_DIV_2 = exports.isAccessList = exports.isAccessListBuffer = exports.Capability = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
/**
 * Can be used in conjunction with {@link Transaction.supports}
 * to query on tx capabilities
 */
var Capability;
(function (Capability) {
    /**
     * Tx supports EIP-155 replay protection
     * See: [155](https://eips.ethereum.org/EIPS/eip-155) Replay Attack Protection EIP
     */
    Capability[Capability["EIP155ReplayProtection"] = 155] = "EIP155ReplayProtection";
    /**
     * Tx supports EIP-1559 gas fee market mechansim
     * See: [1559](https://eips.ethereum.org/EIPS/eip-1559) Fee Market EIP
     */
    Capability[Capability["EIP1559FeeMarket"] = 1559] = "EIP1559FeeMarket";
    /**
     * Tx is a typed transaction as defined in EIP-2718
     * See: [2718](https://eips.ethereum.org/EIPS/eip-2718) Transaction Type EIP
     */
    Capability[Capability["EIP2718TypedTransaction"] = 2718] = "EIP2718TypedTransaction";
    /**
     * Tx supports access list generation as defined in EIP-2930
     * See: [2930](https://eips.ethereum.org/EIPS/eip-2930) Access Lists EIP
     */
    Capability[Capability["EIP2930AccessLists"] = 2930] = "EIP2930AccessLists";
})(Capability = exports.Capability || (exports.Capability = {}));
function isAccessListBuffer(input) {
    if (input.length === 0) {
        return true;
    }
    var firstItem = input[0];
    if (Array.isArray(firstItem)) {
        return true;
    }
    return false;
}
exports.isAccessListBuffer = isAccessListBuffer;
function isAccessList(input) {
    return !isAccessListBuffer(input); // This is exactly the same method, except the output is negated.
}
exports.isAccessList = isAccessList;
/**
 * A const defining secp256k1n/2
 */
exports.N_DIV_2 = new ethereumjs_util_1.BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16);
//# sourceMappingURL=types.js.map
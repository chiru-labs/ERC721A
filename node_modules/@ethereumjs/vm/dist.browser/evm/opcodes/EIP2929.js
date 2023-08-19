"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustSstoreGasEIP2929 = exports.accessStorageEIP2929 = exports.accessAddressEIP2929 = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
/**
 * Adds address to accessedAddresses set if not already included.
 * Adjusts cost incurred for executing opcode based on whether address read
 * is warm/cold. (EIP 2929)
 * @param {RunState} runState
 * @param {BN}       address
 * @param {Common}   common
 * @param {Boolean}  chargeGas (default: true)
 * @param {Boolean}  isSelfdestruct (default: false)
 */
function accessAddressEIP2929(runState, address, common, chargeGas, isSelfdestruct) {
    if (chargeGas === void 0) { chargeGas = true; }
    if (isSelfdestruct === void 0) { isSelfdestruct = false; }
    if (!common.isActivatedEIP(2929))
        return;
    var addressStr = address.buf;
    // Cold
    if (!runState.stateManager.isWarmedAddress(addressStr)) {
        // eslint-disable-next-line prettier/prettier
        runState.stateManager.addWarmedAddress(addressStr);
        // CREATE, CREATE2 opcodes have the address warmed for free.
        // selfdestruct beneficiary address reads are charged an *additional* cold access
        if (chargeGas) {
            runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'coldaccountaccess')), 'EIP-2929 -> coldaccountaccess');
        }
        // Warm: (selfdestruct beneficiary address reads are not charged when warm)
    }
    else if (chargeGas && !isSelfdestruct) {
        runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'warmstorageread')), 'EIP-2929 -> warmstorageread');
    }
}
exports.accessAddressEIP2929 = accessAddressEIP2929;
/**
 * Adds (address, key) to accessedStorage tuple set if not already included.
 * Adjusts cost incurred for executing opcode based on whether storage read
 * is warm/cold. (EIP 2929)
 * @param {RunState} runState
 * @param {Buffer} key (to storage slot)
 * @param {Common} common
 */
function accessStorageEIP2929(runState, key, isSstore, common) {
    if (!common.isActivatedEIP(2929))
        return;
    var address = runState.eei.getAddress().buf;
    var slotIsCold = !runState.stateManager.isWarmedStorage(address, key);
    // Cold (SLOAD and SSTORE)
    if (slotIsCold) {
        // eslint-disable-next-line prettier/prettier
        runState.stateManager.addWarmedStorage(address, key);
        runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'coldsload')), 'EIP-2929 -> coldsload');
    }
    else if (!isSstore) {
        runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'warmstorageread')), 'EIP-2929 -> warmstorageread');
    }
}
exports.accessStorageEIP2929 = accessStorageEIP2929;
/**
 * Adjusts cost of SSTORE_RESET_GAS or SLOAD (aka sstorenoop) (EIP-2200) downward when storage
 * location is already warm
 * @param  {RunState} runState
 * @param  {Buffer}   key          storage slot
 * @param  {number}   defaultCost  SSTORE_RESET_GAS / SLOAD
 * @param  {string}   costName     parameter name ('reset' or 'noop')
 * @param  {Common}   common
 * @return {number}                adjusted cost
 */
function adjustSstoreGasEIP2929(runState, key, defaultCost, costName, common) {
    if (!common.isActivatedEIP(2929))
        return defaultCost;
    var address = runState.eei.getAddress().buf;
    var warmRead = common.param('gasPrices', 'warmstorageread');
    var coldSload = common.param('gasPrices', 'coldsload');
    if (runState.stateManager.isWarmedStorage(address, key)) {
        switch (costName) {
            case 'reset':
                return defaultCost - coldSload;
            case 'noop':
                return warmRead;
            case 'initRefund':
                return common.param('gasPrices', 'sstoreInitGasEIP2200') - warmRead;
            case 'cleanRefund':
                return common.param('gasPrices', 'sstoreReset') - coldSload - warmRead;
        }
    }
    return defaultCost;
}
exports.adjustSstoreGasEIP2929 = adjustSstoreGasEIP2929;
//# sourceMappingURL=EIP2929.js.map
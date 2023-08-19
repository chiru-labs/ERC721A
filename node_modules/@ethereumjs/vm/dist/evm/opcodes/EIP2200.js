"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSstoreGasEIP2200 = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const exceptions_1 = require("../../exceptions");
const EIP2929_1 = require("./EIP2929");
const util_1 = require("./util");
/**
 * Adjusts gas usage and refunds of SStore ops per EIP-2200 (Istanbul)
 *
 * @param {RunState} runState
 * @param {Buffer}   currentStorage
 * @param {Buffer}   originalStorage
 * @param {Buffer}   value
 * @param {Common}   common
 */
function updateSstoreGasEIP2200(runState, currentStorage, originalStorage, value, key, common) {
    // Fail if not enough gas is left
    if (runState.eei.getGasLeft().lten(common.param('gasPrices', 'sstoreSentryGasEIP2200'))) {
        (0, util_1.trap)(exceptions_1.ERROR.OUT_OF_GAS);
    }
    // Noop
    if (currentStorage.equals(value)) {
        const sstoreNoopCost = common.param('gasPrices', 'sstoreNoopGasEIP2200');
        return runState.eei.useGas(new ethereumjs_util_1.BN((0, EIP2929_1.adjustSstoreGasEIP2929)(runState, key, sstoreNoopCost, 'noop', common)), 'EIP-2200 -> sstoreNoopGasEIP2200');
    }
    if (originalStorage.equals(currentStorage)) {
        // Create slot
        if (originalStorage.length === 0) {
            return runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreInitGasEIP2200')), 'EIP-2200 -> sstoreInitGasEIP2200');
        }
        // Delete slot
        if (value.length === 0) {
            runState.eei.refundGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreClearRefundEIP2200')), 'EIP-2200 -> sstoreClearRefundEIP2200');
        }
        // Write existing slot
        return runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreCleanGasEIP2200')), 'EIP-2200 -> sstoreCleanGasEIP2200');
    }
    if (originalStorage.length > 0) {
        if (currentStorage.length === 0) {
            // Recreate slot
            runState.eei.subRefund(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreClearRefundEIP2200')), 'EIP-2200 -> sstoreClearRefundEIP2200');
        }
        else if (value.length === 0) {
            // Delete slot
            runState.eei.refundGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreClearRefundEIP2200')), 'EIP-2200 -> sstoreClearRefundEIP2200');
        }
    }
    if (originalStorage.equals(value)) {
        if (originalStorage.length === 0) {
            // Reset to original non-existent slot
            const sstoreInitRefund = common.param('gasPrices', 'sstoreInitRefundEIP2200');
            runState.eei.refundGas(new ethereumjs_util_1.BN((0, EIP2929_1.adjustSstoreGasEIP2929)(runState, key, sstoreInitRefund, 'initRefund', common)), 'EIP-2200 -> initRefund');
        }
        else {
            // Reset to original existing slot
            const sstoreCleanRefund = common.param('gasPrices', 'sstoreCleanRefundEIP2200');
            runState.eei.refundGas(new ethereumjs_util_1.BN((0, EIP2929_1.adjustSstoreGasEIP2929)(runState, key, sstoreCleanRefund, 'cleanRefund', common)), 'EIP-2200 -> cleanRefund');
        }
    }
    // Dirty update
    return runState.eei.useGas(new ethereumjs_util_1.BN(common.param('gasPrices', 'sstoreDirtyGasEIP2200')), 'EIP-2200 -> sstoreDirtyGasEIP2200');
}
exports.updateSstoreGasEIP2200 = updateSstoreGasEIP2200;
//# sourceMappingURL=EIP2200.js.map
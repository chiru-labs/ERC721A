"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTxReceipt = void 0;
const debug_1 = require("debug");
const ethereumjs_util_1 = require("ethereumjs-util");
const block_1 = require("@ethereumjs/block");
const common_1 = require("@ethereumjs/common");
const tx_1 = require("@ethereumjs/tx");
const bloom_1 = __importDefault(require("./bloom"));
const evm_1 = __importDefault(require("./evm/evm"));
const util_1 = require("./evm/opcodes/util");
const message_1 = __importDefault(require("./evm/message"));
const txContext_1 = __importDefault(require("./evm/txContext"));
const precompiles_1 = require("./evm/precompiles");
const debug = (0, debug_1.debug)('vm:tx');
const debugGas = (0, debug_1.debug)('vm:tx:gas');
/**
 * @ignore
 */
async function runTx(opts) {
    var _a;
    // tx is required
    if (!opts.tx) {
        throw new Error('invalid input, tx is required');
    }
    // create a reasonable default if no block is given
    opts.block = (_a = opts.block) !== null && _a !== void 0 ? _a : block_1.Block.fromBlockData({}, { common: opts.tx.common });
    if (opts.skipBlockGasLimitValidation !== true &&
        opts.block.header.gasLimit.lt(opts.tx.gasLimit)) {
        const msg = _errorMsg('tx has a higher gas limit than the block', this, opts.block, opts.tx);
        throw new Error(msg);
    }
    // Have to cast as `EIP2929StateManager` to access clearWarmedAccounts
    const state = this.stateManager;
    if (opts.reportAccessList && !('generateAccessList' in state)) {
        const msg = _errorMsg('reportAccessList needs a StateManager implementing the generateAccessList() method', this, opts.block, opts.tx);
        throw new Error(msg);
    }
    // Ensure we start with a clear warmed accounts Map
    if (this._common.isActivatedEIP(2929)) {
        state.clearWarmedAccounts();
    }
    await state.checkpoint();
    if (this.DEBUG) {
        debug('-'.repeat(100));
        debug(`tx checkpoint`);
    }
    // Typed transaction specific setup tasks
    if (opts.tx.supports(tx_1.Capability.EIP2718TypedTransaction) && this._common.isActivatedEIP(2718)) {
        // Is it an Access List transaction?
        if (!this._common.isActivatedEIP(2930)) {
            await state.revert();
            const msg = _errorMsg('Cannot run transaction: EIP 2930 is not activated.', this, opts.block, opts.tx);
            throw new Error(msg);
        }
        if (opts.reportAccessList && !('generateAccessList' in state)) {
            await state.revert();
            const msg = _errorMsg('StateManager needs to implement generateAccessList() when running with reportAccessList option', this, opts.block, opts.tx);
            throw new Error(msg);
        }
        if (opts.tx.supports(tx_1.Capability.EIP1559FeeMarket) && !this._common.isActivatedEIP(1559)) {
            await state.revert();
            const msg = _errorMsg('Cannot run transaction: EIP 1559 is not activated.', this, opts.block, opts.tx);
            throw new Error(msg);
        }
        const castedTx = opts.tx;
        castedTx.AccessListJSON.forEach((accessListItem) => {
            const address = (0, ethereumjs_util_1.toBuffer)(accessListItem.address);
            state.addWarmedAddress(address);
            accessListItem.storageKeys.forEach((storageKey) => {
                state.addWarmedStorage(address, (0, ethereumjs_util_1.toBuffer)(storageKey));
            });
        });
    }
    try {
        const result = await _runTx.bind(this)(opts);
        await state.commit();
        if (this.DEBUG) {
            debug(`tx checkpoint committed`);
        }
        if (this._common.isActivatedEIP(2929) && opts.reportAccessList) {
            const { tx } = opts;
            // Do not include sender address in access list
            const removed = [tx.getSenderAddress()];
            // Only include to address on present storage slot accesses
            const onlyStorage = tx.to ? [tx.to] : [];
            result.accessList = state.generateAccessList(removed, onlyStorage);
        }
        return result;
    }
    catch (e) {
        await state.revert();
        if (this.DEBUG) {
            debug(`tx checkpoint reverted`);
        }
        throw e;
    }
    finally {
        if (this._common.isActivatedEIP(2929)) {
            state.clearWarmedAccounts();
        }
    }
}
exports.default = runTx;
async function _runTx(opts) {
    var _a, _b, _c;
    // Casted as `any` to access the EIP2929 methods
    const state = this.stateManager;
    const { tx, block } = opts;
    if (!block) {
        throw new Error('block required');
    }
    /**
     * The `beforeTx` event
     *
     * @event Event: beforeTx
     * @type {Object}
     * @property {Transaction} tx emits the Transaction that is about to be processed
     */
    await this._emit('beforeTx', tx);
    const caller = tx.getSenderAddress();
    if (this.DEBUG) {
        debug(`New tx run hash=${opts.tx.isSigned() ? opts.tx.hash().toString('hex') : 'unsigned'} sender=${caller}`);
    }
    if (this._common.isActivatedEIP(2929)) {
        // Add origin and precompiles to warm addresses
        (0, precompiles_1.getActivePrecompiles)(this._common).forEach((address) => state.addWarmedAddress(address.buf));
        state.addWarmedAddress(caller.buf);
        if (tx.to) {
            // Note: in case we create a contract, we do this in EVMs `_executeCreate` (this is also correct in inner calls, per the EIP)
            state.addWarmedAddress(tx.to.buf);
        }
    }
    // Validate gas limit against tx base fee (DataFee + TxFee + Creation Fee)
    const txBaseFee = tx.getBaseFee();
    const gasLimit = tx.gasLimit.clone();
    if (gasLimit.lt(txBaseFee)) {
        const msg = _errorMsg('base fee exceeds gas limit', this, block, tx);
        throw new Error(msg);
    }
    gasLimit.isub(txBaseFee);
    if (this.DEBUG) {
        debugGas(`Subtracting base fee (${txBaseFee}) from gasLimit (-> ${gasLimit})`);
    }
    if (this._common.isActivatedEIP(1559)) {
        // EIP-1559 spec:
        // Ensure that the user was willing to at least pay the base fee
        // assert transaction.max_fee_per_gas >= block.base_fee_per_gas
        const maxFeePerGas = 'maxFeePerGas' in tx ? tx.maxFeePerGas : tx.gasPrice;
        const baseFeePerGas = block.header.baseFeePerGas;
        if (maxFeePerGas.lt(baseFeePerGas)) {
            const msg = _errorMsg(`Transaction's maxFeePerGas (${maxFeePerGas}) is less than the block's baseFeePerGas (${baseFeePerGas})`, this, block, tx);
            throw new Error(msg);
        }
    }
    // Check from account's balance and nonce
    let fromAccount = await state.getAccount(caller);
    const { nonce, balance } = fromAccount;
    if (!opts.skipBalance) {
        const cost = tx.getUpfrontCost(block.header.baseFeePerGas);
        if (balance.lt(cost)) {
            const msg = _errorMsg(`sender doesn't have enough funds to send tx. The upfront cost is: ${cost} and the sender's account (${caller}) only has: ${balance}`, this, block, tx);
            throw new Error(msg);
        }
        if (tx.supports(tx_1.Capability.EIP1559FeeMarket)) {
            // EIP-1559 spec:
            // The signer must be able to afford the transaction
            // `assert balance >= gas_limit * max_fee_per_gas`
            const cost = tx.gasLimit.mul(tx.maxFeePerGas).add(tx.value);
            if (balance.lt(cost)) {
                const msg = _errorMsg(`sender doesn't have enough funds to send tx. The max cost is: ${cost} and the sender's account (${caller}) only has: ${balance}`, this, block, tx);
                throw new Error(msg);
            }
        }
    }
    if (!opts.skipNonce) {
        if (!nonce.eq(tx.nonce)) {
            const msg = _errorMsg(`the tx doesn't have the correct nonce. account has nonce of: ${nonce} tx has nonce of: ${tx.nonce}`, this, block, tx);
            throw new Error(msg);
        }
    }
    let gasPrice;
    let inclusionFeePerGas;
    // EIP-1559 tx
    if (tx.supports(tx_1.Capability.EIP1559FeeMarket)) {
        const baseFee = block.header.baseFeePerGas;
        inclusionFeePerGas = ethereumjs_util_1.BN.min(tx.maxPriorityFeePerGas, tx.maxFeePerGas.sub(baseFee));
        gasPrice = inclusionFeePerGas.add(baseFee);
    }
    else {
        // Have to cast as legacy tx since EIP1559 tx does not have gas price
        gasPrice = tx.gasPrice;
        if (this._common.isActivatedEIP(1559)) {
            const baseFee = block.header.baseFeePerGas;
            inclusionFeePerGas = tx.gasPrice.sub(baseFee);
        }
    }
    // Update from account's nonce and balance
    fromAccount.nonce.iaddn(1);
    const txCost = tx.gasLimit.mul(gasPrice);
    fromAccount.balance.isub(txCost);
    await state.putAccount(caller, fromAccount);
    if (this.DEBUG) {
        debug(`Update fromAccount (caller) nonce (-> ${fromAccount.nonce}) and balance(-> ${fromAccount.balance})`);
    }
    /*
     * Execute message
     */
    const txContext = new txContext_1.default(gasPrice, caller);
    const { value, data, to } = tx;
    const message = new message_1.default({
        caller,
        gasLimit,
        to,
        value,
        data,
    });
    const evm = new evm_1.default(this, txContext, block);
    if (this.DEBUG) {
        debug(`Running tx=0x${tx.isSigned() ? tx.hash().toString('hex') : 'unsigned'} with caller=${caller} gasLimit=${gasLimit} to=${to ? to.toString() : ''} value=${value} data=0x${(0, util_1.short)(data)}`);
    }
    const results = (await evm.executeMessage(message));
    if (this.DEBUG) {
        debug('-'.repeat(100));
        debug(`Received tx results gasUsed=${results.gasUsed} execResult: [ gasUsed=${results.gasUsed} exceptionError=${results.execResult.exceptionError ? results.execResult.exceptionError.error : ''} returnValue=${(0, util_1.short)(results.execResult.returnValue)} gasRefund=${results.execResult.gasRefund} ]`);
    }
    /*
     * Parse results
     */
    // Generate the bloom for the tx
    results.bloom = txLogsBloom(results.execResult.logs);
    if (this.DEBUG) {
        debug(`Generated tx bloom with logs=${(_a = results.execResult.logs) === null || _a === void 0 ? void 0 : _a.length}`);
    }
    // Caculate the total gas used
    results.gasUsed.iadd(txBaseFee);
    if (this.DEBUG) {
        debugGas(`tx add baseFee ${txBaseFee} to gasUsed (-> ${results.gasUsed})`);
    }
    // Process any gas refund
    let gasRefund = (_b = results.execResult.gasRefund) !== null && _b !== void 0 ? _b : new ethereumjs_util_1.BN(0);
    const maxRefundQuotient = this._common.param('gasConfig', 'maxRefundQuotient');
    if (!gasRefund.isZero()) {
        const maxRefund = results.gasUsed.divn(maxRefundQuotient);
        gasRefund = ethereumjs_util_1.BN.min(gasRefund, maxRefund);
        results.gasUsed.isub(gasRefund);
        if (this.DEBUG) {
            debug(`Subtract tx gasRefund (${gasRefund}) from gasUsed (-> ${results.gasUsed})`);
        }
    }
    else {
        if (this.DEBUG) {
            debug(`No tx gasRefund`);
        }
    }
    results.amountSpent = results.gasUsed.mul(gasPrice);
    // Update sender's balance
    fromAccount = await state.getAccount(caller);
    const actualTxCost = results.gasUsed.mul(gasPrice);
    const txCostDiff = txCost.sub(actualTxCost);
    fromAccount.balance.iadd(txCostDiff);
    await state.putAccount(caller, fromAccount);
    if (this.DEBUG) {
        debug(`Refunded txCostDiff (${txCostDiff}) to fromAccount (caller) balance (-> ${fromAccount.balance})`);
    }
    // Update miner's balance
    let miner;
    if (this._common.consensusType() === common_1.ConsensusType.ProofOfAuthority) {
        // Backwards-compatibilty check
        // TODO: can be removed along VM v6 release
        if ('cliqueSigner' in block.header) {
            miner = block.header.cliqueSigner();
        }
        else {
            miner = ethereumjs_util_1.Address.zero();
        }
    }
    else {
        miner = block.header.coinbase;
    }
    const minerAccount = await state.getAccount(miner);
    // add the amount spent on gas to the miner's account
    if (this._common.isActivatedEIP(1559)) {
        minerAccount.balance.iadd(results.gasUsed.mul(inclusionFeePerGas));
    }
    else {
        minerAccount.balance.iadd(results.amountSpent);
    }
    // Put the miner account into the state. If the balance of the miner account remains zero, note that
    // the state.putAccount function puts this into the "touched" accounts. This will thus be removed when
    // we clean the touched accounts below in case we are in a fork >= SpuriousDragon
    await state.putAccount(miner, minerAccount);
    if (this.DEBUG) {
        debug(`tx update miner account (${miner}) balance (-> ${minerAccount.balance})`);
    }
    /*
     * Cleanup accounts
     */
    if (results.execResult.selfdestruct) {
        const keys = Object.keys(results.execResult.selfdestruct);
        for (const k of keys) {
            const address = new ethereumjs_util_1.Address(Buffer.from(k, 'hex'));
            await state.deleteAccount(address);
            if (this.DEBUG) {
                debug(`tx selfdestruct on address=${address}`);
            }
        }
    }
    await state.cleanupTouchedAccounts();
    state.clearOriginalStorageCache();
    // Generate the tx receipt
    const cumulativeGasUsed = ((_c = opts.blockGasUsed) !== null && _c !== void 0 ? _c : block.header.gasUsed).add(results.gasUsed);
    results.receipt = await generateTxReceipt.bind(this)(tx, results, cumulativeGasUsed);
    /**
     * The `afterTx` event
     *
     * @event Event: afterTx
     * @type {Object}
     * @property {Object} result result of the transaction
     */
    const event = Object.assign({ transaction: tx }, results);
    await this._emit('afterTx', event);
    if (this.DEBUG) {
        debug(`tx run finished hash=${opts.tx.isSigned() ? opts.tx.hash().toString('hex') : 'unsigned'} sender=${caller}`);
    }
    return results;
}
/**
 * @method txLogsBloom
 * @private
 */
function txLogsBloom(logs) {
    const bloom = new bloom_1.default();
    if (logs) {
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            // add the address
            bloom.add(log[0]);
            // add the topics
            const topics = log[1];
            for (let q = 0; q < topics.length; q++) {
                bloom.add(topics[q]);
            }
        }
    }
    return bloom;
}
/**
 * Returns the tx receipt.
 * @param this The vm instance
 * @param tx The transaction
 * @param txResult The tx result
 * @param cumulativeGasUsed The gas used in the block including this tx
 */
async function generateTxReceipt(tx, txResult, cumulativeGasUsed) {
    var _a;
    const baseReceipt = {
        gasUsed: cumulativeGasUsed.toArrayLike(Buffer),
        bitvector: txResult.bloom.bitvector,
        logs: (_a = txResult.execResult.logs) !== null && _a !== void 0 ? _a : [],
    };
    let receipt;
    if (this.DEBUG) {
        debug(`Generate tx receipt transactionType=${tx.type} gasUsed=${cumulativeGasUsed} bitvector=${(0, util_1.short)(baseReceipt.bitvector)} (${baseReceipt.bitvector.length} bytes) logs=${baseReceipt.logs.length}`);
    }
    if (!tx.supports(tx_1.Capability.EIP2718TypedTransaction)) {
        // Legacy transaction
        if (this._common.gteHardfork('byzantium')) {
            // Post-Byzantium
            receipt = Object.assign({ status: txResult.execResult.exceptionError ? 0 : 1 }, baseReceipt);
        }
        else {
            // Pre-Byzantium
            const stateRoot = await this.stateManager.getStateRoot(true);
            receipt = Object.assign({ stateRoot: stateRoot }, baseReceipt);
        }
    }
    else {
        // Typed EIP-2718 Transaction
        receipt = Object.assign({ status: txResult.execResult.exceptionError ? 0 : 1 }, baseReceipt);
    }
    return receipt;
}
exports.generateTxReceipt = generateTxReceipt;
/**
 * Internal helper function to create an annotated error message
 *
 * @param msg Base error message
 * @hidden
 */
function _errorMsg(msg, vm, block, tx) {
    const blockErrorStr = 'errorStr' in block ? block.errorStr() : 'block';
    const txErrorStr = 'errorStr' in tx ? tx.errorStr() : 'tx';
    const errorMsg = `${msg} (${vm.errorStr()} -> ${blockErrorStr} -> ${txErrorStr})`;
    return errorMsg;
}
//# sourceMappingURL=runTx.js.map
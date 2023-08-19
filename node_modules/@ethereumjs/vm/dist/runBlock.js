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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTxReceipt = exports.encodeReceipt = exports.rewardAccount = exports.calculateMinerReward = void 0;
const debug_1 = require("debug");
const merkle_patricia_tree_1 = require("merkle-patricia-tree");
const ethereumjs_util_1 = require("ethereumjs-util");
const block_1 = require("@ethereumjs/block");
const common_1 = require("@ethereumjs/common");
const bloom_1 = __importDefault(require("./bloom"));
const opcodes_1 = require("./evm/opcodes");
const tx_1 = require("@ethereumjs/tx");
const DAOConfig = __importStar(require("./config/dao_fork_accounts_config.json"));
const debug = (0, debug_1.debug)('vm:block');
/* DAO account list */
const DAOAccountList = DAOConfig.DAOAccounts;
const DAORefundContract = DAOConfig.DAORefundContract;
/**
 * @ignore
 */
async function runBlock(opts) {
    const state = this.stateManager;
    const { root } = opts;
    let { block } = opts;
    const generateFields = !!opts.generate;
    /**
     * The `beforeBlock` event.
     *
     * @event Event: beforeBlock
     * @type {Object}
     * @property {Block} block emits the block that is about to be processed
     */
    await this._emit('beforeBlock', block);
    if (this._hardforkByBlockNumber || this._hardforkByTD) {
        this._common.setHardforkByBlockNumber(block.header.number.toNumber(), this._hardforkByTD);
    }
    if (this.DEBUG) {
        debug('-'.repeat(100));
        debug(`Running block hash=${block.hash().toString('hex')} number=${block.header.number} hardfork=${this._common.hardfork()}`);
    }
    // Set state root if provided
    if (root) {
        if (this.DEBUG) {
            debug(`Set provided state root ${root.toString('hex')}`);
        }
        await state.setStateRoot(root);
    }
    // check for DAO support and if we should apply the DAO fork
    if (this._common.hardforkIsActiveOnChain('dao') &&
        block.header.number.eq(this._common.hardforkBlockBN('dao'))) {
        if (this.DEBUG) {
            debug(`Apply DAO hardfork`);
        }
        await _applyDAOHardfork(state);
    }
    // Checkpoint state
    await state.checkpoint();
    if (this.DEBUG) {
        debug(`block checkpoint`);
    }
    let result;
    try {
        result = await applyBlock.bind(this)(block, opts);
        if (this.DEBUG) {
            debug(`Received block results gasUsed=${result.gasUsed} bloom=${(0, opcodes_1.short)(result.bloom.bitvector)} (${result.bloom.bitvector.length} bytes) receiptRoot=${result.receiptRoot.toString('hex')} receipts=${result.receipts.length} txResults=${result.results.length}`);
        }
    }
    catch (err) {
        await state.revert();
        if (this.DEBUG) {
            debug(`block checkpoint reverted`);
        }
        throw err;
    }
    // Persist state
    await state.commit();
    if (this.DEBUG) {
        debug(`block checkpoint committed`);
    }
    const stateRoot = await state.getStateRoot(false);
    // Given the generate option, either set resulting header
    // values to the current block, or validate the resulting
    // header values against the current block.
    if (generateFields) {
        const bloom = result.bloom.bitvector;
        const gasUsed = result.gasUsed;
        const receiptTrie = result.receiptRoot;
        const transactionsTrie = await _genTxTrie(block);
        const generatedFields = { stateRoot, bloom, gasUsed, receiptTrie, transactionsTrie };
        const blockData = Object.assign(Object.assign({}, block), { header: Object.assign(Object.assign({}, block.header), generatedFields) });
        block = block_1.Block.fromBlockData(blockData, { common: this._common });
    }
    else {
        if (result.receiptRoot && !result.receiptRoot.equals(block.header.receiptTrie)) {
            if (this.DEBUG) {
                debug(`Invalid receiptTrie received=${result.receiptRoot.toString('hex')} expected=${block.header.receiptTrie.toString('hex')}`);
            }
            const msg = _errorMsg('invalid receiptTrie', this, block);
            throw new Error(msg);
        }
        if (!result.bloom.bitvector.equals(block.header.logsBloom)) {
            if (this.DEBUG) {
                debug(`Invalid bloom received=${result.bloom.bitvector.toString('hex')} expected=${block.header.logsBloom.toString('hex')}`);
            }
            const msg = _errorMsg('invalid bloom', this, block);
            throw new Error(msg);
        }
        if (!result.gasUsed.eq(block.header.gasUsed)) {
            if (this.DEBUG) {
                debug(`Invalid gasUsed received=${result.gasUsed} expected=${block.header.gasUsed}`);
            }
            const msg = _errorMsg('invalid gasUsed', this, block);
            throw new Error(msg);
        }
        if (!stateRoot.equals(block.header.stateRoot)) {
            if (this.DEBUG) {
                debug(`Invalid stateRoot received=${stateRoot.toString('hex')} expected=${block.header.stateRoot.toString('hex')}`);
            }
            const msg = _errorMsg('invalid block stateRoot', this, block);
            throw new Error(msg);
        }
    }
    const results = {
        receipts: result.receipts,
        results: result.results,
        stateRoot,
        gasUsed: result.gasUsed,
        logsBloom: result.bloom.bitvector,
        receiptRoot: result.receiptRoot,
    };
    const afterBlockEvent = Object.assign(Object.assign({}, results), { block });
    /**
     * The `afterBlock` event
     *
     * @event Event: afterBlock
     * @type {AfterBlockEvent}
     * @property {AfterBlockEvent} result emits the results of processing a block
     */
    await this._emit('afterBlock', afterBlockEvent);
    if (this.DEBUG) {
        debug(`Running block finished hash=${block.hash().toString('hex')} number=${block.header.number} hardfork=${this._common.hardfork()}`);
    }
    return results;
}
exports.default = runBlock;
/**
 * Validates and applies a block, computing the results of
 * applying its transactions. This method doesn't modify the
 * block itself. It computes the block rewards and puts
 * them on state (but doesn't persist the changes).
 * @param {Block} block
 * @param {RunBlockOpts} opts
 */
async function applyBlock(block, opts) {
    // Validate block
    if (!opts.skipBlockValidation) {
        if (block.header.gasLimit.gte(new ethereumjs_util_1.BN('8000000000000000', 16))) {
            const msg = _errorMsg('Invalid block with gas limit greater than (2^63 - 1)', this, block);
            throw new Error(msg);
        }
        else {
            if (this.DEBUG) {
                debug(`Validate block`);
            }
            await block.validate(this.blockchain);
        }
    }
    // Apply transactions
    if (this.DEBUG) {
        debug(`Apply transactions`);
    }
    const blockResults = await applyTransactions.bind(this)(block, opts);
    // Pay ommers and miners
    if (block._common.consensusType() === common_1.ConsensusType.ProofOfWork) {
        await assignBlockRewards.bind(this)(block);
    }
    return blockResults;
}
/**
 * Applies the transactions in a block, computing the receipts
 * as well as gas usage and some relevant data. This method is
 * side-effect free (it doesn't modify the block nor the state).
 * @param {Block} block
 * @param {RunBlockOpts} opts
 */
async function applyTransactions(block, opts) {
    const bloom = new bloom_1.default();
    // the total amount of gas used processing these transactions
    let gasUsed = new ethereumjs_util_1.BN(0);
    const receiptTrie = new merkle_patricia_tree_1.BaseTrie();
    const receipts = [];
    const txResults = [];
    /*
     * Process transactions
     */
    for (let txIdx = 0; txIdx < block.transactions.length; txIdx++) {
        const tx = block.transactions[txIdx];
        let maxGasLimit;
        if (this._common.isActivatedEIP(1559)) {
            maxGasLimit = block.header.gasLimit.muln(this._common.param('gasConfig', 'elasticityMultiplier'));
        }
        else {
            maxGasLimit = block.header.gasLimit;
        }
        const gasLimitIsHigherThanBlock = maxGasLimit.lt(tx.gasLimit.add(gasUsed));
        if (gasLimitIsHigherThanBlock) {
            const msg = _errorMsg('tx has a higher gas limit than the block', this, block);
            throw new Error(msg);
        }
        // Run the tx through the VM
        const { skipBalance, skipNonce } = opts;
        const txRes = await this.runTx({
            tx,
            block,
            skipBalance,
            skipNonce,
            blockGasUsed: gasUsed,
        });
        txResults.push(txRes);
        if (this.DEBUG) {
            debug('-'.repeat(100));
        }
        // Add to total block gas usage
        gasUsed = gasUsed.add(txRes.gasUsed);
        if (this.DEBUG) {
            debug(`Add tx gas used (${txRes.gasUsed}) to total block gas usage (-> ${gasUsed})`);
        }
        // Combine blooms via bitwise OR
        bloom.or(txRes.bloom);
        // Add receipt to trie to later calculate receipt root
        receipts.push(txRes.receipt);
        const encodedReceipt = encodeReceipt(tx, txRes.receipt);
        await receiptTrie.put(ethereumjs_util_1.rlp.encode(txIdx), encodedReceipt);
    }
    return {
        bloom,
        gasUsed,
        receiptRoot: receiptTrie.root,
        receipts,
        results: txResults,
    };
}
/**
 * Calculates block rewards for miner and ommers and puts
 * the updated balances of their accounts to state.
 */
async function assignBlockRewards(block) {
    if (this.DEBUG) {
        debug(`Assign block rewards`);
    }
    const state = this.stateManager;
    const minerReward = new ethereumjs_util_1.BN(this._common.param('pow', 'minerReward'));
    const ommers = block.uncleHeaders;
    // Reward ommers
    for (const ommer of ommers) {
        const reward = calculateOmmerReward(ommer.number, block.header.number, minerReward);
        const account = await rewardAccount(state, ommer.coinbase, reward);
        if (this.DEBUG) {
            debug(`Add uncle reward ${reward} to account ${ommer.coinbase} (-> ${account.balance})`);
        }
    }
    // Reward miner
    const reward = calculateMinerReward(minerReward, ommers.length);
    const account = await rewardAccount(state, block.header.coinbase, reward);
    if (this.DEBUG) {
        debug(`Add miner reward ${reward} to account ${block.header.coinbase} (-> ${account.balance})`);
    }
}
function calculateOmmerReward(ommerBlockNumber, blockNumber, minerReward) {
    const heightDiff = blockNumber.sub(ommerBlockNumber);
    let reward = new ethereumjs_util_1.BN(8).sub(heightDiff).mul(minerReward.divn(8));
    if (reward.ltn(0)) {
        reward = new ethereumjs_util_1.BN(0);
    }
    return reward;
}
function calculateMinerReward(minerReward, ommersNum) {
    // calculate nibling reward
    const niblingReward = minerReward.divn(32);
    const totalNiblingReward = niblingReward.muln(ommersNum);
    const reward = minerReward.add(totalNiblingReward);
    return reward;
}
exports.calculateMinerReward = calculateMinerReward;
async function rewardAccount(state, address, reward) {
    const account = await state.getAccount(address);
    account.balance.iadd(reward);
    await state.putAccount(address, account);
    return account;
}
exports.rewardAccount = rewardAccount;
/**
 * Returns the encoded tx receipt.
 */
function encodeReceipt(tx, receipt) {
    const encoded = ethereumjs_util_1.rlp.encode(Object.values(receipt));
    if (!tx.supports(tx_1.Capability.EIP2718TypedTransaction)) {
        return encoded;
    }
    const type = (0, ethereumjs_util_1.intToBuffer)(tx.type);
    return Buffer.concat([type, encoded]);
}
exports.encodeReceipt = encodeReceipt;
/**
 * Generates the tx receipt and returns { txReceipt, encodedReceipt, receiptLog }
 * @deprecated Please use the new `generateTxReceipt` located in runTx.
 */
async function generateTxReceipt(tx, txRes, blockGasUsed) {
    var _a;
    const abstractTxReceipt = {
        gasUsed: blockGasUsed.toArrayLike(Buffer),
        bitvector: txRes.bloom.bitvector,
        logs: (_a = txRes.execResult.logs) !== null && _a !== void 0 ? _a : [],
    };
    let txReceipt;
    let encodedReceipt;
    let receiptLog = `Generate tx receipt transactionType=${tx.type} gasUsed=${blockGasUsed} bitvector=${(0, opcodes_1.short)(abstractTxReceipt.bitvector)} (${abstractTxReceipt.bitvector.length} bytes) logs=${abstractTxReceipt.logs.length}`;
    if (!tx.supports(999)) {
        // Legacy transaction
        if (this._common.gteHardfork('byzantium')) {
            // Post-Byzantium
            txReceipt = Object.assign({ status: txRes.execResult.exceptionError ? 0 : 1 }, abstractTxReceipt);
            const statusInfo = txRes.execResult.exceptionError ? 'error' : 'ok';
            receiptLog += ` status=${txReceipt.status} (${statusInfo}) (>= Byzantium)`;
        }
        else {
            // Pre-Byzantium
            const stateRoot = await this.stateManager.getStateRoot(true);
            txReceipt = Object.assign({ stateRoot: stateRoot }, abstractTxReceipt);
            receiptLog += ` stateRoot=${txReceipt.stateRoot.toString('hex')} (< Byzantium)`;
        }
        encodedReceipt = ethereumjs_util_1.rlp.encode(Object.values(txReceipt));
    }
    else {
        // EIP2930 Transaction
        txReceipt = Object.assign({ status: txRes.execResult.exceptionError ? 0 : 1 }, abstractTxReceipt);
        encodedReceipt = Buffer.concat([(0, ethereumjs_util_1.intToBuffer)(tx.type), ethereumjs_util_1.rlp.encode(Object.values(txReceipt))]);
    }
    return {
        txReceipt,
        encodedReceipt,
        receiptLog,
    };
}
exports.generateTxReceipt = generateTxReceipt;
// apply the DAO fork changes to the VM
async function _applyDAOHardfork(state) {
    const DAORefundContractAddress = new ethereumjs_util_1.Address(Buffer.from(DAORefundContract, 'hex'));
    if (!state.accountExists(DAORefundContractAddress)) {
        await state.putAccount(DAORefundContractAddress, new ethereumjs_util_1.Account());
    }
    const DAORefundAccount = await state.getAccount(DAORefundContractAddress);
    for (const addr of DAOAccountList) {
        // retrieve the account and add it to the DAO's Refund accounts' balance.
        const address = new ethereumjs_util_1.Address(Buffer.from(addr, 'hex'));
        const account = await state.getAccount(address);
        DAORefundAccount.balance.iadd(account.balance);
        // clear the accounts' balance
        account.balance = new ethereumjs_util_1.BN(0);
        await state.putAccount(address, account);
    }
    // finally, put the Refund Account
    await state.putAccount(DAORefundContractAddress, DAORefundAccount);
}
async function _genTxTrie(block) {
    const trie = new merkle_patricia_tree_1.BaseTrie();
    for (const [i, tx] of block.transactions.entries()) {
        await trie.put(ethereumjs_util_1.rlp.encode(i), tx.serialize());
    }
    return trie.root;
}
/**
 * Internal helper function to create an annotated error message
 *
 * @param msg Base error message
 * @hidden
 */
function _errorMsg(msg, vm, block) {
    const blockErrorStr = 'errorStr' in block ? block.errorStr() : 'block';
    const errorMsg = `${msg} (${vm.errorStr()} -> ${blockErrorStr})`;
    return errorMsg;
}
//# sourceMappingURL=runBlock.js.map
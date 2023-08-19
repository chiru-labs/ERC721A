"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockBuilder = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const merkle_patricia_tree_1 = require("merkle-patricia-tree");
const block_1 = require("@ethereumjs/block");
const common_1 = require("@ethereumjs/common");
const bloom_1 = __importDefault(require("./bloom"));
const runBlock_1 = require("./runBlock");
class BlockBuilder {
    constructor(vm, opts) {
        var _a, _b, _c, _d, _e, _f;
        /**
         * The cumulative gas used by the transactions added to the block.
         */
        this.gasUsed = new ethereumjs_util_1.BN(0);
        this.transactions = [];
        this.transactionResults = [];
        this.checkpointed = false;
        this.reverted = false;
        this.built = false;
        this.vm = vm;
        this.blockOpts = Object.assign(Object.assign({ putBlockIntoBlockchain: true }, opts.blockOpts), { common: this.vm._common });
        this.headerData = Object.assign(Object.assign({}, opts.headerData), { parentHash: (_b = (_a = opts.headerData) === null || _a === void 0 ? void 0 : _a.parentHash) !== null && _b !== void 0 ? _b : opts.parentBlock.hash(), number: (_d = (_c = opts.headerData) === null || _c === void 0 ? void 0 : _c.number) !== null && _d !== void 0 ? _d : opts.parentBlock.header.number.addn(1), gasLimit: (_f = (_e = opts.headerData) === null || _e === void 0 ? void 0 : _e.gasLimit) !== null && _f !== void 0 ? _f : opts.parentBlock.header.gasLimit });
        if (this.vm._common.isActivatedEIP(1559) && this.headerData.baseFeePerGas === undefined) {
            this.headerData.baseFeePerGas = opts.parentBlock.header.calcNextBaseFee();
        }
    }
    /**
     * Throws if the block has already been built or reverted.
     */
    checkStatus() {
        if (this.built) {
            throw new Error('Block has already been built');
        }
        if (this.reverted) {
            throw new Error('State has already been reverted');
        }
    }
    /**
     * Calculates and returns the transactionsTrie for the block.
     */
    async transactionsTrie() {
        const trie = new merkle_patricia_tree_1.BaseTrie();
        for (const [i, tx] of this.transactions.entries()) {
            await trie.put(ethereumjs_util_1.rlp.encode(i), tx.serialize());
        }
        return trie.root;
    }
    /**
     * Calculates and returns the logs bloom for the block.
     */
    logsBloom() {
        const bloom = new bloom_1.default();
        for (const txResult of this.transactionResults) {
            // Combine blooms via bitwise OR
            bloom.or(txResult.bloom);
        }
        return bloom.bitvector;
    }
    /**
     * Calculates and returns the receiptTrie for the block.
     */
    async receiptTrie() {
        const gasUsed = new ethereumjs_util_1.BN(0);
        const receiptTrie = new merkle_patricia_tree_1.BaseTrie();
        for (const [i, txResult] of this.transactionResults.entries()) {
            const tx = this.transactions[i];
            gasUsed.iadd(txResult.gasUsed);
            const encodedReceipt = (0, runBlock_1.encodeReceipt)(tx, txResult.receipt);
            await receiptTrie.put(ethereumjs_util_1.rlp.encode(i), encodedReceipt);
        }
        return receiptTrie.root;
    }
    /**
     * Adds the block miner reward to the coinbase account.
     */
    async rewardMiner() {
        const minerReward = new ethereumjs_util_1.BN(this.vm._common.param('pow', 'minerReward'));
        const reward = (0, runBlock_1.calculateMinerReward)(minerReward, 0);
        const coinbase = this.headerData.coinbase
            ? new ethereumjs_util_1.Address((0, ethereumjs_util_1.toBuffer)(this.headerData.coinbase))
            : ethereumjs_util_1.Address.zero();
        await (0, runBlock_1.rewardAccount)(this.vm.stateManager, coinbase, reward);
    }
    /**
     * Run and add a transaction to the block being built.
     * Please note that this modifies the state of the VM.
     * Throws if the transaction's gasLimit is greater than
     * the remaining gas in the block.
     */
    async addTransaction(tx) {
        this.checkStatus();
        if (!this.checkpointed) {
            await this.vm.stateManager.checkpoint();
            this.checkpointed = true;
        }
        // According to the Yellow Paper, a transaction's gas limit
        // cannot be greater than the remaining gas in the block
        const blockGasLimit = new ethereumjs_util_1.BN((0, ethereumjs_util_1.toBuffer)(this.headerData.gasLimit));
        const blockGasRemaining = blockGasLimit.sub(this.gasUsed);
        if (tx.gasLimit.gt(blockGasRemaining)) {
            throw new Error('tx has a higher gas limit than the remaining gas in the block');
        }
        const header = Object.assign(Object.assign({}, this.headerData), { gasUsed: this.gasUsed });
        const blockData = { header, transactions: this.transactions };
        const block = block_1.Block.fromBlockData(blockData, this.blockOpts);
        const result = await this.vm.runTx({ tx, block });
        this.transactions.push(tx);
        this.transactionResults.push(result);
        this.gasUsed.iadd(result.gasUsed);
        return result;
    }
    /**
     * Reverts the checkpoint on the StateManager to reset the state from any transactions that have been run.
     */
    async revert() {
        this.checkStatus();
        if (this.checkpointed) {
            await this.vm.stateManager.revert();
            this.reverted = true;
        }
    }
    /**
     * This method returns the finalized block.
     * It also:
     *  - Assigns the reward for miner (PoW)
     *  - Commits the checkpoint on the StateManager
     *  - Sets the tip of the VM's blockchain to this block
     * For PoW, optionally seals the block with params `nonce` and `mixHash`,
     * which is validated along with the block number and difficulty by ethash.
     * For PoA, please pass `blockOption.cliqueSigner` into the buildBlock constructor,
     * as the signer will be awarded the txs amount spent on gas as they are added.
     */
    async build(sealOpts) {
        var _a, _b, _c;
        this.checkStatus();
        const blockOpts = this.blockOpts;
        const consensusType = this.vm._common.consensusType();
        if (consensusType === common_1.ConsensusType.ProofOfWork) {
            await this.rewardMiner();
        }
        const stateRoot = await this.vm.stateManager.getStateRoot(true);
        const transactionsTrie = await this.transactionsTrie();
        const receiptTrie = await this.receiptTrie();
        const logsBloom = this.logsBloom();
        const gasUsed = this.gasUsed;
        const timestamp = (_a = this.headerData.timestamp) !== null && _a !== void 0 ? _a : Math.round(Date.now() / 1000);
        const headerData = Object.assign(Object.assign({}, this.headerData), { stateRoot,
            transactionsTrie,
            receiptTrie,
            logsBloom,
            gasUsed,
            timestamp });
        if (consensusType === common_1.ConsensusType.ProofOfWork) {
            headerData.nonce = (_b = sealOpts === null || sealOpts === void 0 ? void 0 : sealOpts.nonce) !== null && _b !== void 0 ? _b : headerData.nonce;
            headerData.mixHash = (_c = sealOpts === null || sealOpts === void 0 ? void 0 : sealOpts.mixHash) !== null && _c !== void 0 ? _c : headerData.mixHash;
        }
        const blockData = { header: headerData, transactions: this.transactions };
        const block = block_1.Block.fromBlockData(blockData, blockOpts);
        if (this.blockOpts.putBlockIntoBlockchain) {
            await this.vm.blockchain.putBlock(block);
        }
        this.built = true;
        if (this.checkpointed) {
            await this.vm.stateManager.commit();
            this.checkpointed = false;
        }
        return block;
    }
}
exports.BlockBuilder = BlockBuilder;
async function buildBlock(opts) {
    return new BlockBuilder(this, opts);
}
exports.default = buildBlock;
//# sourceMappingURL=buildBlock.js.map
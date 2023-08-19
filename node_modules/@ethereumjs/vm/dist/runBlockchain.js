"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @ignore
 */
async function runBlockchain(blockchain, maxBlocks) {
    let headBlock;
    let parentState;
    blockchain = blockchain !== null && blockchain !== void 0 ? blockchain : this.blockchain;
    return await blockchain.iterator('vm', async (block, reorg) => {
        // determine starting state for block run
        // if we are just starting or if a chain re-org has happened
        if (!headBlock || reorg) {
            const parentBlock = await blockchain.getBlock(block.header.parentHash);
            parentState = parentBlock.header.stateRoot;
            // generate genesis state if we are at the genesis block
            // we don't have the genesis state
            if (!headBlock) {
                await this.stateManager.generateCanonicalGenesis();
            }
            else {
                parentState = headBlock.header.stateRoot;
            }
        }
        // run block, update head if valid
        try {
            await this.runBlock({ block, root: parentState });
            // set as new head block
            headBlock = block;
        }
        catch (error) {
            // remove invalid block
            await blockchain.delBlock(block.header.hash());
            throw error;
        }
    }, maxBlocks);
}
exports.default = runBlockchain;
//# sourceMappingURL=runBlockchain.js.map
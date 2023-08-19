"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointTrie = void 0;
const baseTrie_1 = require("./baseTrie");
const checkpointDb_1 = require("./checkpointDb");
/**
 * Adds checkpointing to the {@link BaseTrie}
 */
class CheckpointTrie extends baseTrie_1.Trie {
    constructor(...args) {
        super(...args);
        this.db = new checkpointDb_1.CheckpointDB(...args);
    }
    /**
     * Is the trie during a checkpoint phase?
     */
    get isCheckpoint() {
        return this.db.isCheckpoint;
    }
    /**
     * Creates a checkpoint that can later be reverted to or committed.
     * After this is called, all changes can be reverted until `commit` is called.
     */
    checkpoint() {
        this.db.checkpoint(this.root);
    }
    /**
     * Commits a checkpoint to disk, if current checkpoint is not nested.
     * If nested, only sets the parent checkpoint as current checkpoint.
     * @throws If not during a checkpoint phase
     */
    async commit() {
        if (!this.isCheckpoint) {
            throw new Error('trying to commit when not checkpointed');
        }
        await this.lock.wait();
        await this.db.commit();
        this.lock.signal();
    }
    /**
     * Reverts the trie to the state it was at when `checkpoint` was first called.
     * If during a nested checkpoint, sets root to most recent checkpoint, and sets
     * parent checkpoint as current.
     */
    async revert() {
        if (!this.isCheckpoint) {
            throw new Error('trying to revert when not checkpointed');
        }
        await this.lock.wait();
        this.root = await this.db.revert();
        this.lock.signal();
    }
    /**
     * Returns a copy of the underlying trie with the interface of CheckpointTrie.
     * @param includeCheckpoints - If true and during a checkpoint, the copy will contain the checkpointing metadata and will use the same scratch as underlying db.
     */
    copy(includeCheckpoints = true) {
        const db = this.db.copy();
        const trie = new CheckpointTrie(db._leveldb, this.root);
        if (includeCheckpoints && this.isCheckpoint) {
            trie.db.checkpoints = [...this.db.checkpoints];
        }
        return trie;
    }
}
exports.CheckpointTrie = CheckpointTrie;
//# sourceMappingURL=checkpointTrie.js.map
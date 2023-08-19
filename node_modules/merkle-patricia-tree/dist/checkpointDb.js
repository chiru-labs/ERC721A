"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointDB = void 0;
const db_1 = require("./db");
/**
 * DB is a thin wrapper around the underlying levelup db,
 * which validates inputs and sets encoding type.
 */
class CheckpointDB extends db_1.DB {
    /**
     * Initialize a DB instance. If `leveldb` is not provided, DB
     * defaults to an [in-memory store](https://github.com/Level/memdown).
     * @param leveldb - An abstract-leveldown compliant store
     */
    constructor(leveldb) {
        super(leveldb);
        // Roots of trie at the moment of checkpoint
        this.checkpoints = [];
    }
    /**
     * Is the DB during a checkpoint phase?
     */
    get isCheckpoint() {
        return this.checkpoints.length > 0;
    }
    /**
     * Adds a new checkpoint to the stack
     * @param root
     */
    checkpoint(root) {
        this.checkpoints.push({ keyValueMap: new Map(), root });
    }
    /**
     * Commits the latest checkpoint
     */
    async commit() {
        const { keyValueMap } = this.checkpoints.pop();
        if (!this.isCheckpoint) {
            // This was the final checkpoint, we should now commit and flush everything to disk
            const batchOp = [];
            keyValueMap.forEach(function (value, key) {
                if (value === null) {
                    batchOp.push({
                        type: 'del',
                        key: Buffer.from(key, 'binary'),
                    });
                }
                else {
                    batchOp.push({
                        type: 'put',
                        key: Buffer.from(key, 'binary'),
                        value,
                    });
                }
            });
            await this.batch(batchOp);
        }
        else {
            // dump everything into the current (higher level) cache
            const currentKeyValueMap = this.checkpoints[this.checkpoints.length - 1].keyValueMap;
            keyValueMap.forEach((value, key) => currentKeyValueMap.set(key, value));
        }
    }
    /**
     * Reverts the latest checkpoint
     */
    async revert() {
        const { root } = this.checkpoints.pop();
        return root;
    }
    /**
     * Retrieves a raw value from leveldb.
     * @param key
     * @returns A Promise that resolves to `Buffer` if a value is found or `null` if no value is found.
     */
    async get(key) {
        // Lookup the value in our cache. We return the latest checkpointed value (which should be the value on disk)
        for (let index = this.checkpoints.length - 1; index >= 0; index--) {
            const value = this.checkpoints[index].keyValueMap.get(key.toString('binary'));
            if (value !== undefined) {
                return value;
            }
        }
        // Nothing has been found in cache, look up from disk
        const value = await super.get(key);
        if (this.isCheckpoint) {
            // Since we are a checkpoint, put this value in cache, so future `get` calls will not look the key up again from disk.
            this.checkpoints[this.checkpoints.length - 1].keyValueMap.set(key.toString('binary'), value);
        }
        return value;
    }
    /**
     * Writes a value directly to leveldb.
     * @param key The key as a `Buffer`
     * @param value The value to be stored
     */
    async put(key, val) {
        if (this.isCheckpoint) {
            // put value in cache
            this.checkpoints[this.checkpoints.length - 1].keyValueMap.set(key.toString('binary'), val);
        }
        else {
            await super.put(key, val);
        }
    }
    /**
     * Removes a raw value in the underlying leveldb.
     * @param keys
     */
    async del(key) {
        if (this.isCheckpoint) {
            // delete the value in the current cache
            this.checkpoints[this.checkpoints.length - 1].keyValueMap.set(key.toString('binary'), null);
        }
        else {
            // delete the value on disk
            await this._leveldb.del(key, db_1.ENCODING_OPTS);
        }
    }
    /**
     * Performs a batch operation on db.
     * @param opStack A stack of levelup operations
     */
    async batch(opStack) {
        if (this.isCheckpoint) {
            for (const op of opStack) {
                if (op.type === 'put') {
                    await this.put(op.key, op.value);
                }
                else if (op.type === 'del') {
                    await this.del(op.key);
                }
            }
        }
        else {
            await super.batch(opStack);
        }
    }
}
exports.CheckpointDB = CheckpointDB;
//# sourceMappingURL=checkpointDb.js.map
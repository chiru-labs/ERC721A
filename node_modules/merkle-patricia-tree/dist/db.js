"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = exports.ENCODING_OPTS = void 0;
const level = require('level-mem');
exports.ENCODING_OPTS = { keyEncoding: 'binary', valueEncoding: 'binary' };
/**
 * DB is a thin wrapper around the underlying levelup db,
 * which validates inputs and sets encoding type.
 */
class DB {
    /**
     * Initialize a DB instance. If `leveldb` is not provided, DB
     * defaults to an [in-memory store](https://github.com/Level/memdown).
     * @param leveldb - An abstract-leveldown compliant store
     */
    constructor(leveldb) {
        this._leveldb = leveldb !== null && leveldb !== void 0 ? leveldb : level();
    }
    /**
     * Retrieves a raw value from leveldb.
     * @param key
     * @returns A Promise that resolves to `Buffer` if a value is found or `null` if no value is found.
     */
    async get(key) {
        let value = null;
        try {
            value = await this._leveldb.get(key, exports.ENCODING_OPTS);
        }
        catch (error) {
            if (error.notFound) {
                // not found, returning null
            }
            else {
                throw error;
            }
        }
        return value;
    }
    /**
     * Writes a value directly to leveldb.
     * @param key The key as a `Buffer`
     * @param value The value to be stored
     */
    async put(key, val) {
        await this._leveldb.put(key, val, exports.ENCODING_OPTS);
    }
    /**
     * Removes a raw value in the underlying leveldb.
     * @param keys
     */
    async del(key) {
        await this._leveldb.del(key, exports.ENCODING_OPTS);
    }
    /**
     * Performs a batch operation on db.
     * @param opStack A stack of levelup operations
     */
    async batch(opStack) {
        await this._leveldb.batch(opStack, exports.ENCODING_OPTS);
    }
    /**
     * Returns a copy of the DB instance, with a reference
     * to the **same** underlying leveldb instance.
     */
    copy() {
        return new DB(this._leveldb);
    }
}
exports.DB = DB;
//# sourceMappingURL=db.js.map
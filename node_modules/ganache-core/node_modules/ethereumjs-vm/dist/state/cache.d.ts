/// <reference types="node" />
import Account from 'ethereumjs-account';
/**
 * @ignore
 */
export default class Cache {
    _cache: any;
    _checkpoints: any[];
    _trie: any;
    constructor(trie: any);
    /**
     * Puts account to cache under its address.
     * @param key - Address of account
     * @param val - Account
     */
    put(key: Buffer, val: Account, fromTrie?: boolean): void;
    /**
     * Returns the queried account or an empty account.
     * @param key - Address of account
     */
    get(key: Buffer): Account;
    /**
     * Returns the queried account or undefined.
     * @param key - Address of account
     */
    lookup(key: Buffer): Account | undefined;
    /**
     * Looks up address in underlying trie.
     * @param address - Address of account
     * @param cb - Callback with params (err, account)
     */
    _lookupAccount(address: Buffer, cb: any): void;
    /**
     * Looks up address in cache, if not found, looks it up
     * in the underlying trie.
     * @param key - Address of account
     * @param cb - Callback with params (err, account)
     */
    getOrLoad(key: Buffer, cb: any): void;
    /**
     * Warms cache by loading their respective account from trie
     * and putting them in cache.
     * @param addresses - Array of addresses
     * @param cb - Callback
     */
    warm(addresses: string[], cb: any): void;
    /**
     * Flushes cache by updating accounts that have been modified
     * and removing accounts that have been deleted.
     * @param cb - Callback
     */
    flush(cb: any): void;
    /**
     * Marks current state of cache as checkpoint, which can
     * later on be reverted or commited.
     */
    checkpoint(): void;
    /**
     * Revert changes to cache last checkpoint (no effect on trie).
     */
    revert(): void;
    /**
     * Commits to current state of cache (no effect on trie).
     */
    commit(): void;
    /**
     * Clears cache.
     */
    clear(): void;
    /**
     * Marks address as deleted in cache.
     * @param key - Address
     */
    del(key: Buffer): void;
    _update(key: Buffer, val: Account, modified: boolean, deleted: boolean): void;
}

import { Account, Address } from 'ethereumjs-util';
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
    put(key: Address, val: Account, fromTrie?: boolean): void;
    /**
     * Returns the queried account or an empty account.
     * @param key - Address of account
     */
    get(key: Address): Account;
    /**
     * Returns the queried account or undefined.
     * @param key - Address of account
     */
    lookup(key: Address): Account | undefined;
    /**
     * Returns true if the key was deleted and thus existed in the cache earlier
     * @param key - trie key to lookup
     */
    keyIsDeleted(key: Address): boolean;
    /**
     * Looks up address in underlying trie.
     * @param address - Address of account
     */
    _lookupAccount(address: Address): Promise<Account | undefined>;
    /**
     * Looks up address in cache, if not found, looks it up
     * in the underlying trie.
     * @param key - Address of account
     */
    getOrLoad(address: Address): Promise<Account>;
    /**
     * Warms cache by loading their respective account from trie
     * and putting them in cache.
     * @param addresses - Array of addresses
     */
    warm(addresses: string[]): Promise<void>;
    /**
     * Flushes cache by updating accounts that have been modified
     * and removing accounts that have been deleted.
     */
    flush(): Promise<void>;
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
    del(key: Address): void;
    /**
     * Generic cache update helper function
     *
     * @param key
     * @param value
     * @param modified - Has the value been modfied or is it coming unchanged from the trie (also used for deleted accounts)
     * @param deleted - Delete operation on an account
     * @param virtual - Account doesn't exist in the underlying trie
     */
    _update(key: Address, value: Account, modified: boolean, deleted: boolean, virtual?: boolean): void;
}

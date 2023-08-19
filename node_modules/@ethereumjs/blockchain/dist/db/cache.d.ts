/// <reference types="node" />
import LRUCache from 'lru-cache';
/**
 * Simple LRU Cache that allows for keys of type Buffer
 * @hidden
 */
export default class Cache<V> {
    _cache: LRUCache<string, V>;
    constructor(opts: LRUCache.Options<string, V>);
    set(key: string | Buffer, value: V): void;
    get(key: string | Buffer): V | undefined;
    del(key: string | Buffer): void;
}

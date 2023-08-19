/// <reference types="node" />
import * as LRU from 'lru-cache';
/**
 * Simple LRU Cache that allows for keys of type Buffer
 * @hidden
 */
export default class Cache<V> {
    _cache: LRU<string, V>;
    constructor(opts: LRU.Options<string, V>);
    set(key: string | Buffer, value: V): void;
    get(key: string | Buffer): V | undefined;
    del(key: string | Buffer): void;
}

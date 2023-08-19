/// <reference types="node" />
interface TrieGetCb {
    (err: any, value: Buffer | null): void;
}
interface TriePutCb {
    (err?: any): void;
}
interface Trie {
    root: Buffer;
    copy(): Trie;
    getRaw(key: Buffer, cb: TrieGetCb): void;
    putRaw(key: Buffer | string, value: Buffer, cb: TriePutCb): void;
    get(key: Buffer | string, cb: TrieGetCb): void;
    put(key: Buffer | string, value: Buffer | string, cb: TriePutCb): void;
}
export default class Account {
    nonce: Buffer;
    balance: Buffer;
    stateRoot: Buffer;
    codeHash: Buffer;
    constructor(data?: any);
    serialize(): Buffer;
    isContract(): boolean;
    getCode(trie: Trie, cb: TrieGetCb): void;
    setCode(trie: Trie, code: Buffer, cb: (err: any, codeHash: Buffer) => void): void;
    getStorage(trie: Trie, key: Buffer | string, cb: TrieGetCb): void;
    setStorage(trie: Trie, key: Buffer | string, val: Buffer | string, cb: () => void): void;
    isEmpty(): boolean;
}
export {};

/// <reference types="node" />
export default class Bloom {
    bitvector: Buffer;
    /**
     * Represents a Bloom filter.
     */
    constructor(bitvector?: Buffer);
    /**
     * Adds an element to a bit vector of a 64 byte bloom filter.
     * @param e - The element to add
     */
    add(e: Buffer): void;
    /**
     * Checks if an element is in the bloom.
     * @param e - The element to check
     */
    check(e: Buffer): boolean;
    /**
     * Checks if multiple topics are in a bloom.
     * @returns `true` if every topic is in the bloom
     */
    multiCheck(topics: Buffer[]): boolean;
    /**
     * Bitwise or blooms together.
     */
    or(bloom: Bloom): void;
}

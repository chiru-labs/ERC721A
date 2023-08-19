/// <reference types="bn.js" />
import { BN } from 'ethereumjs-util';
/**
 * Implementation of the stack used in evm.
 */
export default class Stack {
    _store: BN[];
    _maxHeight: number;
    constructor(maxHeight?: number);
    get length(): number;
    push(value: BN): void;
    pop(): BN;
    /**
     * Pop multiple items from stack. Top of stack is first item
     * in returned array.
     * @param num - Number of items to pop
     */
    popN(num?: number): BN[];
    /**
     * Swap top of stack with an item in the stack.
     * @param position - Index of item from top of the stack (0-indexed)
     */
    swap(position: number): void;
    /**
     * Pushes a copy of an item in the stack.
     * @param position - Index of item to be copied (1-indexed)
     */
    dup(position: number): void;
}

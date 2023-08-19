import type BN from "bn.js";
import type { StorageLength, Slot } from "./types";
export declare function isWordsLength(size: StorageLength): size is {
    words: number;
};
export declare function storageLengthToBytes(size: StorageLength): number;
/**
 * convert a slot to a word corresponding to actual storage address
 *
 * if `slot` is an array, return hash of array values.
 * if `slot` array is nested, recurse on sub-arrays
 *
 * @param slot - number or possibly-nested array of numbers
 */
export declare function slotAddress(slot: Slot): BN;
export declare function equalSlots(slot1: Slot | undefined, slot2: Slot | undefined): boolean;

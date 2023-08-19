import type BN from "bn.js";
import type * as Elementary from "../format/elementary";
export declare type StorageLength = {
    bytes: number;
} | {
    words: number;
};
export interface Range {
    from: StoragePosition;
    to?: StoragePosition;
    length?: number;
}
export interface StoragePosition {
    slot: Slot;
    index: number;
}
export interface Slot {
    key?: Elementary.ElementaryValue;
    path?: Slot;
    hashPath?: boolean;
    offset: BN;
}

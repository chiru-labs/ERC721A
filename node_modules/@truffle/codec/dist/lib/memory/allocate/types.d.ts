import type * as Format from "../../format";
import type * as Pointer from "../../pointer";
export interface MemoryAllocations {
    [id: string]: MemoryAllocation;
}
export interface MemoryAllocation {
    members: MemoryMemberAllocation[];
}
export interface MemoryMemberAllocation {
    name: string;
    type: Format.Types.Type;
    pointer: Pointer.MemoryPointer;
}

import type { MemoryAllocations, MemoryAllocation, MemoryMemberAllocation } from "./types";
import type * as Format from "../../format";
export { MemoryAllocations, MemoryAllocation, MemoryMemberAllocation };
export declare function getMemoryAllocations(userDefinedTypes: Format.Types.TypesById): MemoryAllocations;
export declare function isSkippedInMemoryStructs(dataType: Format.Types.Type): boolean;

import type * as Format from "../../format";
import type { InternalFunction } from "../types";
export declare function functionTableEntryToType(functionEntry: InternalFunction): Format.Types.ContractTypeNative;
export declare function makeInternalFunctionId(functionEntry: InternalFunction): string;

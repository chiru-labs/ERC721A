import type * as Format from "../../format";
import type { Context } from "../types";
export declare function contextToType(context: Context): Format.Types.ContractType;
export declare function makeTypeId(astId: number, compilationId: string): string;

import type { Abi as SchemaAbi } from "@truffle/contract-schema/spec";
import type { Abi, Entry } from "./types";
export declare const normalize: (looseAbi: SchemaAbi | Abi) => Abi;
declare type Item<A> = A extends (infer I)[] ? I : never;
export declare const normalizeEntry: (looseEntry: Item<SchemaAbi> | Entry) => Entry;
export {};
//# sourceMappingURL=normalize.d.ts.map
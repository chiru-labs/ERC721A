export declare type Abi = Entry[];
export declare type Entry = FunctionEntry | ConstructorEntry | FallbackEntry | ReceiveEntry | EventEntry | ErrorEntry;
export declare type StateMutability = "pure" | "view" | "nonpayable" | "payable";
export interface FunctionEntry {
    type: "function";
    name: string;
    inputs: Parameter[];
    outputs: Parameter[];
    stateMutability: StateMutability;
}
export interface ConstructorEntry {
    type: "constructor";
    inputs: Parameter[];
    stateMutability: "payable" | "nonpayable";
}
export interface FallbackEntry {
    type: "fallback";
    stateMutability: "payable" | "nonpayable";
}
export interface ReceiveEntry {
    type: "receive";
    stateMutability: "payable";
}
export interface EventEntry {
    type: "event";
    name: string;
    inputs: EventParameter[];
    anonymous: boolean;
}
export interface ErrorEntry {
    type: "error";
    name: string;
    inputs: Parameter[];
}
export interface Parameter {
    name: string;
    type: string;
    components?: Parameter[];
    internalType?: string;
}
export interface EventParameter extends Parameter {
    indexed: boolean;
}
//# sourceMappingURL=types.d.ts.map
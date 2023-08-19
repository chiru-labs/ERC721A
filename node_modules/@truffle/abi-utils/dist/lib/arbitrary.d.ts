import * as fc from "fast-check";
export declare const Parameter: () => fc.Arbitrary<any>;
export declare const EventParameter: () => fc.Arbitrary<any>;
export declare const EventEntry: () => fc.Arbitrary<{
    type: string;
    name: string;
    inputs: any[];
    anonymous: boolean;
}>;
export declare const ErrorEntry: () => fc.Arbitrary<{
    type: string;
    name: string;
    inputs: any[];
}>;
export declare const FunctionEntry: () => fc.Arbitrary<Partial<{
    type: string;
}> | {
    name: string;
    inputs: any[];
} | Partial<{
    outputs: any[];
}> | {
    stateMutability: string;
} | {
    payable: boolean;
    constant: boolean;
}>;
export declare const ReceiveEntry: () => fc.Arbitrary<{
    type: string;
    stateMutability: string;
}>;
export declare const FallbackEntry: () => fc.Arbitrary<{
    stateMutability: string;
    type: string;
} | {
    payable: boolean;
    type: string;
}>;
export declare const ConstructorEntry: () => fc.Arbitrary<{
    stateMutability: string;
    type: string;
    inputs: any[];
} | {
    payable: boolean;
    type: string;
    inputs: any[];
}>;
export declare const Abi: () => fc.Arbitrary<(Partial<{
    type: string;
}> | {
    name: string;
    inputs: any[];
} | Partial<{
    outputs: any[];
}> | {
    stateMutability: string;
} | {
    payable: boolean;
    constant: boolean;
})[]>;
//# sourceMappingURL=arbitrary.d.ts.map
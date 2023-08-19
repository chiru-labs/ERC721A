export interface StandardContractJSON {
    abi: any;
    evm: {
        bytecode: {
            object: any;
        };
    };
}
export interface SimpleContractJSON {
    abi: any[];
    bytecode: string;
}
export declare type ContractJSON = StandardContractJSON | SimpleContractJSON;
export declare const isStandard: (data: ContractJSON) => data is StandardContractJSON;
export declare function hasByteCode(bytecode: {
    object: any;
} | string): boolean;

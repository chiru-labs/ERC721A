export interface LinkableContract {
    evm: {
        bytecode: {
            object: any;
        };
    };
}
export declare function link(contract: LinkableContract, libraryName: string, libraryAddress: string): void;

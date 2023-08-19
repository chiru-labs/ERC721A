/// <reference types="node" />
export interface IFormat {
    coinType: number;
    name: string;
    encoder: (data: Buffer) => string;
    decoder: (data: string) => Buffer;
}
export declare const formats: IFormat[];
export declare const formatsByName: {
    [key: string]: IFormat;
};
export declare const formatsByCoinType: {
    [key: number]: IFormat;
};

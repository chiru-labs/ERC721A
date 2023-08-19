export declare type EvmType = BooleanType | IntegerType | UnsignedIntegerType | StringType | BytesType | DynamicBytesType | AddressType | ArrayType | TupleType;
/**
 * Like EvmType but with void
 */
export declare type EvmOutputType = EvmType | VoidType;
export declare type BooleanType = {
    type: 'boolean';
    originalType: string;
};
export declare type IntegerType = {
    type: 'integer';
    bits: number;
    originalType: string;
};
export declare type UnsignedIntegerType = {
    type: 'uinteger';
    bits: number;
    originalType: string;
};
export declare type StringType = {
    type: 'string';
    originalType: string;
};
export declare type BytesType = {
    type: 'bytes';
    size: number;
    originalType: string;
};
export declare type DynamicBytesType = {
    type: 'dynamic-bytes';
    originalType: string;
};
export declare type AddressType = {
    type: 'address';
    originalType: string;
};
export declare type ArrayType = {
    type: 'array';
    itemType: EvmType;
    size?: number;
    originalType: string;
};
export declare type TupleType = {
    type: 'tuple';
    components: EvmSymbol[];
    originalType: string;
};
export declare type VoidType = {
    type: 'void';
};
export declare type EvmSymbol = {
    type: EvmType;
    name: string;
};
export declare function parseEvmType(rawType: string, components?: EvmSymbol[], internalType?: string): EvmType;

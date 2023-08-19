import { EvmType, EvmOutputType, TupleType, AbiParameter, AbiOutputParameter } from 'typechain';
export declare function generateInputTypes(input: Array<AbiParameter>): string;
export declare function generateOutputTypes(returnResultObject: boolean, outputs: Array<AbiOutputParameter>): string;
export declare function generateInputType(evmType: EvmType): string;
export declare function generateOutputType(evmType: EvmOutputType): string;
export declare function generateTupleType(tuple: TupleType, generator: (evmType: EvmType) => string): string;
export declare function generateOutputTupleType(tuple: TupleType): string;

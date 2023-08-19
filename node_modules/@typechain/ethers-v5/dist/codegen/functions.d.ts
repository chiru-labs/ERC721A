import { FunctionDeclaration } from 'typechain';
interface GenerateFunctionOptions {
    returnResultObject?: boolean;
    isStaticCall?: boolean;
    overrideOutput?: string;
}
export declare function codegenFunctions(options: GenerateFunctionOptions, fns: FunctionDeclaration[]): string;
export declare function codegenForOverloadedFunctions(options: GenerateFunctionOptions, fns: FunctionDeclaration[]): string;
export {};

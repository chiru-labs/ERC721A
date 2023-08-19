import TruffleError from "@truffle/error";
export declare class CompileError extends TruffleError {
    message: string;
    constructor(message: string);
}

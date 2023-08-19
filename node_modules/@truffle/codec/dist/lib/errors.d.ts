import * as Format from "./format";
/**
 * @hidden
 */
export declare class DecodingError extends Error {
    error: Format.Errors.ErrorForThrowing;
    constructor(error: Format.Errors.ErrorForThrowing);
}
/**
 * @hidden
 */
export declare class StopDecodingError extends Error {
    error: Format.Errors.DecoderError;
    allowRetry: boolean;
    constructor(error: Format.Errors.DecoderError, allowRetry?: boolean);
}
/**
 * @hidden
 */
export declare function handleDecodingError(dataType: Format.Types.Type, error: any, strict?: boolean): Format.Errors.ErrorResult;
/**
 * This error indicates that the user attempted to instantiate a decoder
 * with no project information (by explicitly overriding the default).
 * @category Exception
 */
export declare class NoProjectInfoError extends Error {
    constructor();
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoProjectInfoError = exports.handleDecodingError = exports.StopDecodingError = exports.DecodingError = void 0;
const Format = __importStar(require("./format"));
//For when we need to throw an error, here's a wrapper class that extends Error.
//Apologies about the confusing name, but I wanted something that would make
//sense should it not be caught and thus accidentally exposed to the outside.
/**
 * @hidden
 */
class DecodingError extends Error {
    constructor(error) {
        super(Format.Utils.Exception.message(error));
        this.error = error;
        this.name = "DecodingError";
    }
}
exports.DecodingError = DecodingError;
//used to stop decoding; like DecodingError, but used in contexts
//where I don't expect it to be caught
//NOTE: currently we don't actually check the type of a thrown error,
//we just rely on context.  still, I think it makes sense to be a separate
//type.
/**
 * @hidden
 */
class StopDecodingError extends Error {
    //when decoding in full mode, we allow an ABI-mode retry.  (if we were already in
    //ABI mode, we give up.)
    constructor(error, allowRetry) {
        const message = `Stopping decoding: ${error.kind}`; //sorry about the bare-bones message,
        //but again, users shouldn't actually see this, so I think this should suffice for now
        super(message);
        this.error = error;
        this.allowRetry = Boolean(allowRetry);
    }
}
exports.StopDecodingError = StopDecodingError;
/**
 * @hidden
 */
function handleDecodingError(dataType, error, strict = false) {
    if (error instanceof DecodingError) {
        //expected error
        if (strict) {
            //strict mode -- stop decoding on errors
            throw new StopDecodingError(error.error);
        }
        else {
            //nonstrict mode -- return an error result
            return {
                //I don't know why TS's inference is failing here and needs the coercion
                type: dataType,
                kind: "error",
                error: error.error
            };
        }
    }
    else {
        //if it's *not* an expected error, we better not swallow it -- rethrow!
        throw error;
    }
}
exports.handleDecodingError = handleDecodingError;
/**
 * This error indicates that the user attempted to instantiate a decoder
 * with no project information (by explicitly overriding the default).
 * @category Exception
 */
class NoProjectInfoError extends Error {
    constructor() {
        super("No project information specified.");
        this.name = "NoProjectInfoError";
    }
}
exports.NoProjectInfoError = NoProjectInfoError;
//# sourceMappingURL=errors.js.map
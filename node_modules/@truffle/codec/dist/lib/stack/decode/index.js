"use strict";
/**
 * @protected
 *
 * @packageDocumentation
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeLiteral = exports.decodeStack = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:stack:decode");
const AbiData = __importStar(require("../../abi-data"));
const Conversion = __importStar(require("../../conversion"));
const Format = __importStar(require("../../format"));
const read_1 = __importDefault(require("../../read"));
const Basic = __importStar(require("../../basic"));
const Memory = __importStar(require("../../memory"));
const Storage = __importStar(require("../../storage"));
const Evm = __importStar(require("../../evm"));
const errors_1 = require("../../errors");
function* decodeStack(dataType, pointer, info) {
    let rawValue;
    try {
        rawValue = yield* read_1.default(pointer, info.state);
    }
    catch (error) {
        return errors_1.handleDecodingError(dataType, error);
    }
    const literalPointer = {
        location: "stackliteral",
        literal: rawValue
    };
    return yield* decodeLiteral(dataType, literalPointer, info);
}
exports.decodeStack = decodeStack;
function* decodeLiteral(dataType, pointer, info) {
    debug("type %O", dataType);
    debug("pointer %o", pointer);
    if (Format.Types.isReferenceType(dataType)) {
        switch (dataType.location) {
            case "memory":
                //first: do we have a memory pointer? if so we can just dispatch to
                //decodeMemoryReference
                return yield* Memory.Decode.decodeMemoryReferenceByAddress(dataType, pointer, info);
            case "storage":
                //next: do we have a storage pointer (which may be a mapping)? if so, we can
                //we dispatch to decodeStorageByAddress
                return yield* Storage.Decode.decodeStorageReferenceByAddress(dataType, pointer, info);
            case "calldata":
                //next: do we have a calldata pointer?
                //if it's a lookup type, it'll need special handling
                if (dataType.typeClass === "bytes" ||
                    dataType.typeClass === "string" ||
                    (dataType.typeClass === "array" && dataType.kind === "dynamic")) {
                    const lengthAsBN = Conversion.toBN(pointer.literal.slice(Evm.Utils.WORD_SIZE));
                    const locationOnly = pointer.literal.slice(0, Evm.Utils.WORD_SIZE);
                    return yield* AbiData.Decode.decodeAbiReferenceByAddress(dataType, { location: "stackliteral", literal: locationOnly }, info, {
                        abiPointerBase: 0,
                        lengthOverride: lengthAsBN
                    });
                }
                else {
                    //multivalue case -- this case is straightforward
                    return yield* AbiData.Decode.decodeAbiReferenceByAddress(dataType, pointer, info, {
                        abiPointerBase: 0 //let's be explicit
                    });
                }
        }
    }
    //next: do we have an external function?  these work differently on the stack
    //than elsewhere, so we can't just pass it on to decodeBasic.
    if (dataType.typeClass === "function" && dataType.visibility === "external") {
        let address = pointer.literal.slice(0, Evm.Utils.WORD_SIZE);
        let selectorWord = pointer.literal.slice(-Evm.Utils.WORD_SIZE);
        if (!Basic.Decode.checkPaddingLeft(address, Evm.Utils.ADDRESS_SIZE) ||
            !Basic.Decode.checkPaddingLeft(selectorWord, Evm.Utils.SELECTOR_SIZE)) {
            return {
                type: dataType,
                kind: "error",
                error: {
                    kind: "FunctionExternalStackPaddingError",
                    rawAddress: Conversion.toHexString(address),
                    rawSelector: Conversion.toHexString(selectorWord)
                }
            };
        }
        let selector = selectorWord.slice(-Evm.Utils.SELECTOR_SIZE);
        return {
            type: dataType,
            kind: "value",
            value: yield* Basic.Decode.decodeExternalFunction(address, selector, info)
        };
    }
    //finally, if none of the above hold, we can just dispatch to decodeBasic.
    //however, note that because we're on the stack, we use the permissive padding
    //option so that errors won't result due to values with bad padding
    //(of numeric or bytesN type, anyway)
    return yield* Basic.Decode.decodeBasic(dataType, pointer, info, {
        paddingMode: "permissive"
    });
}
exports.decodeLiteral = decodeLiteral;
//# sourceMappingURL=index.js.map
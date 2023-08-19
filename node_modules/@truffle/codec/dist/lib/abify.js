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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.abifyReturndataDecoding = exports.abifyLogDecoding = exports.abifyCalldataDecoding = exports.abifyResult = exports.abifyType = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:abify");
const Format = __importStar(require("./format"));
const Common = __importStar(require("./common"));
const Conversion = __importStar(require("./conversion"));
/** @category ABIfication */
function abifyType(dataType, userDefinedTypes) {
    switch (dataType.typeClass) {
        //we only need to specially handle types that don't go in
        //the ABI, or that have some information loss when going
        //in the ABI
        //note that we do need to handle arrays, due to recursion!
        //First: types that do not go in the ABI
        case "mapping":
        case "magic":
        case "type":
            return undefined;
        //Next: address & contract, these can get handled together
        case "address":
        case "contract":
            return {
                typeClass: "address",
                kind: "general",
                typeHint: Format.Types.typeString(dataType)
            };
        case "function":
            switch (dataType.visibility) {
                case "external":
                    return {
                        typeClass: "function",
                        visibility: "external",
                        kind: "general",
                        typeHint: Format.Types.typeString(dataType)
                    };
                case "internal": //these don't go in the ABI
                    return undefined;
            }
            break; //to satisfy TypeScript
        //the complex cases: struct & enum
        case "struct": {
            const fullType = (Format.Types.fullType(dataType, userDefinedTypes));
            if (!fullType.memberTypes) {
                let typeToDisplay = Format.Types.typeString(dataType);
                throw new Common.UnknownUserDefinedTypeError(dataType.id, typeToDisplay);
            }
            const memberTypes = fullType.memberTypes.map(({ name, type: memberType }) => ({
                name,
                type: abifyType(memberType, userDefinedTypes)
            }));
            return {
                typeClass: "tuple",
                typeHint: Format.Types.typeString(fullType),
                memberTypes
            };
        }
        case "enum": {
            const fullType = (Format.Types.fullType(dataType, userDefinedTypes));
            if (!fullType.options) {
                let typeToDisplay = Format.Types.typeString(dataType);
                throw new Common.UnknownUserDefinedTypeError(dataType.id, typeToDisplay);
            }
            let numOptions = fullType.options.length;
            let bits = 8 * Math.ceil(Math.log2(numOptions) / 8);
            return {
                typeClass: "uint",
                bits,
                typeHint: Format.Types.typeString(fullType)
            };
        }
        case "userDefinedValueType": {
            const fullType = (Format.Types.fullType(dataType, userDefinedTypes));
            if (!fullType.underlyingType) {
                let typeToDisplay = Format.Types.typeString(dataType);
                throw new Common.UnknownUserDefinedTypeError(dataType.id, typeToDisplay);
            }
            const abifiedUnderlying = abifyType(fullType.underlyingType, userDefinedTypes);
            return Object.assign(Object.assign({}, abifiedUnderlying), { typeHint: Format.Types.typeStringWithoutLocation(dataType) });
        }
        //finally: arrays
        case "array":
            return Object.assign(Object.assign({}, dataType), { typeHint: Format.Types.typeString(dataType), baseType: abifyType(dataType.baseType, userDefinedTypes) });
        //default case: just leave as-is
        default:
            return dataType;
    }
}
exports.abifyType = abifyType;
/** @category ABIfication */
function abifyResult(result, userDefinedTypes) {
    switch (result.type.typeClass) {
        case "mapping": //doesn't go in ABI
        case "magic": //doesn't go in ABI
        case "type": //doesn't go in ABI
            return undefined;
        case "address":
            //abify the type but leave the value alone
            return Object.assign(Object.assign({}, result), { type: abifyType(result.type, userDefinedTypes) });
        case "contract": {
            let coercedResult = result;
            switch (coercedResult.kind) {
                case "value":
                    return {
                        type: (abifyType(result.type, userDefinedTypes)),
                        kind: "value",
                        value: {
                            asAddress: coercedResult.value.address,
                            rawAsHex: coercedResult.value.rawAddress
                        }
                    };
                case "error":
                    switch (coercedResult.error.kind) {
                        case "ContractPaddingError":
                            return {
                                type: (abifyType(result.type, userDefinedTypes)),
                                kind: "error",
                                error: {
                                    kind: "AddressPaddingError",
                                    paddingType: coercedResult.error.paddingType,
                                    raw: coercedResult.error.raw
                                }
                            };
                        default:
                            //other contract errors are generic errors!
                            //but TS doesn't know this so we coerce
                            return Object.assign(Object.assign({}, coercedResult), { type: (abifyType(result.type, userDefinedTypes)) });
                    }
            }
            break; //to satisfy typescript
        }
        case "function":
            switch (result.type.visibility) {
                case "external": {
                    let coercedResult = result;
                    return Object.assign(Object.assign({}, coercedResult), { type: (abifyType(result.type, userDefinedTypes)) });
                }
                case "internal": //these don't go in the ABI
                    return undefined;
            }
            break; //to satisfy TypeScript
        case "struct": {
            let coercedResult = result;
            switch (coercedResult.kind) {
                case "value":
                    if (coercedResult.reference !== undefined) {
                        return undefined; //no circular values in the ABI!
                    }
                    let abifiedMembers = coercedResult.value.map(({ name, value: member }) => ({
                        name,
                        value: abifyResult(member, userDefinedTypes)
                    }));
                    return {
                        kind: "value",
                        type: (abifyType(result.type, userDefinedTypes)),
                        value: abifiedMembers
                    };
                case "error":
                    return Object.assign(Object.assign({}, coercedResult), { type: (abifyType(result.type, userDefinedTypes)) //note: may throw exception
                     });
            }
        }
        case "userDefinedValueType": {
            const coercedResult = result;
            switch (coercedResult.kind) {
                case "value":
                    return abifyResult(coercedResult.value, userDefinedTypes);
                case "error":
                    return Object.assign(Object.assign({}, coercedResult), { type: abifyType(result.type, userDefinedTypes) });
            }
            break; //to satisfy TS :P
        }
        case "enum": {
            //NOTE: this is the one case where errors are converted to non-error values!!
            //(other than recursively, I mean)
            //be aware!
            let coercedResult = result;
            let uintType = (abifyType(result.type, userDefinedTypes)); //may throw exception
            switch (coercedResult.kind) {
                case "value":
                    return {
                        type: uintType,
                        kind: "value",
                        value: {
                            asBN: coercedResult.value.numericAsBN.clone()
                        }
                    };
                case "error":
                    switch (coercedResult.error.kind) {
                        case "EnumOutOfRangeError":
                            return {
                                type: uintType,
                                kind: "value",
                                value: {
                                    asBN: coercedResult.error.rawAsBN.clone()
                                }
                            };
                        case "EnumPaddingError":
                            return {
                                type: uintType,
                                kind: "error",
                                error: {
                                    kind: "UintPaddingError",
                                    paddingType: coercedResult.error.paddingType,
                                    raw: coercedResult.error.raw
                                }
                            };
                        case "EnumNotFoundDecodingError":
                            let numericValue = coercedResult.error.rawAsBN.clone();
                            if (numericValue.bitLength() <= uintType.bits) {
                                return {
                                    type: uintType,
                                    kind: "value",
                                    value: {
                                        asBN: numericValue
                                    }
                                };
                            }
                            else {
                                return {
                                    type: uintType,
                                    kind: "error",
                                    error: {
                                        kind: "UintPaddingError",
                                        paddingType: "left",
                                        raw: Conversion.toHexString(numericValue)
                                    }
                                };
                            }
                        default:
                            return {
                                type: uintType,
                                kind: "error",
                                error: coercedResult.error
                            };
                    }
            }
        }
        case "array": {
            let coercedResult = result;
            switch (coercedResult.kind) {
                case "value":
                    if (coercedResult.reference !== undefined) {
                        return undefined; //no circular values in the ABI!
                    }
                    let abifiedMembers = coercedResult.value.map(member => abifyResult(member, userDefinedTypes));
                    return {
                        kind: "value",
                        type: (abifyType(result.type, userDefinedTypes)),
                        value: abifiedMembers
                    };
                case "error":
                    return Object.assign(Object.assign({}, coercedResult), { type: (abifyType(result.type, userDefinedTypes)) });
            }
        }
        default:
            return result; //just coerce :-/
    }
}
exports.abifyResult = abifyResult;
/** @category ABIfication */
function abifyCalldataDecoding(decoding, userDefinedTypes) {
    if (decoding.decodingMode === "abi") {
        return decoding;
    }
    switch (decoding.kind) {
        case "function":
        case "constructor":
            return Object.assign(Object.assign({}, decoding), { decodingMode: "abi", arguments: decoding.arguments.map(argument => (Object.assign(Object.assign({}, argument), { value: abifyResult(argument.value, userDefinedTypes) }))) });
        default:
            return Object.assign(Object.assign({}, decoding), { decodingMode: "abi" });
    }
}
exports.abifyCalldataDecoding = abifyCalldataDecoding;
/** @category ABIfication */
function abifyLogDecoding(decoding, userDefinedTypes) {
    if (decoding.decodingMode === "abi") {
        return decoding;
    }
    return Object.assign(Object.assign({}, decoding), { decodingMode: "abi", arguments: decoding.arguments.map(argument => (Object.assign(Object.assign({}, argument), { value: abifyResult(argument.value, userDefinedTypes) }))) });
}
exports.abifyLogDecoding = abifyLogDecoding;
/** @category ABIfication */
function abifyReturndataDecoding(decoding, userDefinedTypes) {
    if (decoding.decodingMode === "abi") {
        return decoding;
    }
    switch (decoding.kind) {
        case "return":
        case "revert":
            return Object.assign(Object.assign({}, decoding), { decodingMode: "abi", arguments: decoding.arguments.map(argument => (Object.assign(Object.assign({}, argument), { value: abifyResult(argument.value, userDefinedTypes) }))) });
        case "bytecode":
            return Object.assign(Object.assign({}, decoding), { decodingMode: "abi", immutables: undefined });
        default:
            return Object.assign(Object.assign({}, decoding), { decodingMode: "abi" });
    }
}
exports.abifyReturndataDecoding = abifyReturndataDecoding;
//# sourceMappingURL=abify.js.map
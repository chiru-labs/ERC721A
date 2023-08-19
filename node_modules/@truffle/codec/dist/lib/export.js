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
exports.nativizeEventArgs = exports.nativizeReturn = exports.nativize = exports.unsafeNativize = exports.ResultInspector = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:export");
const Conversion = __importStar(require("./conversion"));
const inspect_1 = require("./format/utils/inspect");
Object.defineProperty(exports, "ResultInspector", { enumerable: true, get: function () { return inspect_1.ResultInspector; } });
Object.defineProperty(exports, "unsafeNativize", { enumerable: true, get: function () { return inspect_1.unsafeNativize; } });
/**
 * This function is similar to
 * [[Format.Utils.Inspect.unsafeNativize|unsafeNativize]], but is intended to
 * be safe, and also allows for different output formats.  The only currently
 * supported format is "ethers", which is intended to match the way that
 * Truffle Contract currently returns values (based on the Ethers decoder).  As
 * such, it only handles ABI types, and in addition does not handle the types
 * fixed, ufixed, or function.  Note that in these cases it returns `undefined`
 * rather than throwing, as we want this function to be used in contexts where
 * it had better not throw.  It also does not handle circularities, for similar
 * reasons.
 *
 * To handle numeric types, this function takes an optional numberFormatter
 * option that tells it how to handle numbers; this function should take a
 * BigInt as input.  By default, this function will be the identity, and so
 * numbers will be represented as BigInts.
 *
 * Note that this function begins by calling abify, so out-of-range enums (that
 * aren't so out-of-range as to be padding errors) will not return `undefined`.
 * Out-of-range booleans similarly will return true rather than `undefined`.
 * However, other range errors may return `undefined`; this may technically be a
 * slight incompatibility with existing behavior, but should not be relevant
 * except in quite unusual cases.
 *
 * In order to match the behavior for tuples, tuples will be transformed into
 * arrays, but named entries will additionally be keyed by name.  Moreover,
 * indexed variables of reference type will be nativized to an undecoded hex
 * string.
 */
function nativize(result, options = {}) {
    const numberFormatter = options.numberFormatter || (x => x);
    const format = options.format || "ethers";
    switch (format) {
        case "ethers":
            return ethersCompatibleNativize(result, numberFormatter);
    }
}
exports.nativize = nativize;
function ethersCompatibleNativize(result, numberFormatter = x => x) {
    //note: the original version of this function began by calling abify,
    //but we don't do that here because abify requires a userDefinedTypes
    //parameter and we don't want that.
    //However, it only needs that to handle getting the types right.  Since
    //we don't care about that here, we instead do away with abify and handle
    //such matters ourselves (which is less convenient, yeah).
    switch (result.kind) {
        case "error":
            switch (result.error.kind) {
                case "IndexedReferenceTypeError":
                    //strictly speaking for arrays ethers will fail to decode
                    //rather than do this, but, eh
                    return result.error.raw;
                case "EnumOutOfRangeError":
                    return numberFormatter(Conversion.toBigInt(result.error.rawAsBN));
                default:
                    return undefined;
            }
        case "value":
            switch (result.type.typeClass) {
                case "uint":
                case "int":
                    const asBN = (result).value.asBN;
                    return numberFormatter(Conversion.toBigInt(asBN));
                case "enum":
                    const numericAsBN = (result).value.numericAsBN;
                    return numberFormatter(Conversion.toBigInt(numericAsBN));
                case "bool":
                    return result.value.asBoolean;
                case "bytes":
                    const asHex = result.value.asHex;
                    return asHex !== "0x" ? asHex : null;
                case "address":
                    return result.value.asAddress;
                case "contract":
                    return result.value.address;
                case "string": {
                    const coercedResult = result;
                    switch (coercedResult.value.kind) {
                        case "valid":
                            return coercedResult.value.asString;
                        case "malformed":
                            // this will turn malformed utf-8 into replacement characters (U+FFFD) (WARNING)
                            // note we need to cut off the 0x prefix
                            return Buffer.from(coercedResult.value.asHex.slice(2), "hex").toString();
                    }
                }
                case "userDefinedValueType":
                    return ethersCompatibleNativize(result.value, numberFormatter);
                case "array":
                    return result.value.map(value => ethersCompatibleNativize(value, numberFormatter));
                case "tuple":
                case "struct":
                    //in this case, we need the result to be an array, but also
                    //to have the field names (where extant) as keys
                    const nativized = [];
                    const pairs = result.value;
                    for (const { name, value } of pairs) {
                        const nativizedValue = ethersCompatibleNativize(value, numberFormatter);
                        nativized.push(nativizedValue);
                        if (name) {
                            nativized[name] = nativizedValue;
                        }
                    }
                    return nativized;
                case "function":
                    switch (result.type.visibility) {
                        case "external":
                            const coercedResult = result;
                            //ethers per se doesn't handle this, but web3's hacked version will
                            //sometimes decode these as just a bytes24, so let's do that
                            return coercedResult.value.contract.address.toLowerCase() +
                                coercedResult.value.selector.slice(2);
                        case "internal":
                            return undefined;
                    }
                case "fixed":
                case "ufixed":
                default:
                    return undefined;
            }
    }
}
/**
 * This function is similar to [[nativize]], but takes
 * a [[ReturndataDecoding]].  If there's only one returned value, it
 * will be run through compatibleNativize but otherwise unaltered;
 * otherwise the results will be put in an object.
 *
 * Note that if the ReturndataDecoding is not a [[ReturnDecoding]],
 * this will just return `undefined`.
 */
function nativizeReturn(decoding, options = {}) {
    const numberFormatter = options.numberFormatter || (x => x);
    const format = options.format || "ethers";
    switch (format) {
        case "ethers":
            return ethersCompatibleNativizeReturn(decoding, numberFormatter);
    }
}
exports.nativizeReturn = nativizeReturn;
function ethersCompatibleNativizeReturn(decoding, numberFormatter = x => x) {
    if (decoding.kind !== "return") {
        return undefined;
    }
    if (decoding.arguments.length === 1) {
        return ethersCompatibleNativize(decoding.arguments[0].value, numberFormatter);
    }
    const result = {};
    for (let i = 0; i < decoding.arguments.length; i++) {
        const { name, value } = decoding.arguments[i];
        const nativized = ethersCompatibleNativize(value, numberFormatter);
        result[i] = nativized;
        if (name) {
            result[name] = nativized;
        }
    }
    return result;
}
/**
 * This function is similar to [[compatibleNativize]], but takes
 * a [[LogDecoding]], and puts the results in an object.  Note
 * that this does not return the entire event info, but just the
 * `args` for the event.
 */
function nativizeEventArgs(decoding, options = {}) {
    const numberFormatter = options.numberFormatter || (x => x);
    const format = options.format || "ethers";
    switch (format) {
        case "ethers":
            return ethersCompatibleNativizeEventArgs(decoding, numberFormatter);
    }
}
exports.nativizeEventArgs = nativizeEventArgs;
function ethersCompatibleNativizeEventArgs(decoding, numberFormatter = x => x) {
    const result = {};
    for (let i = 0; i < decoding.arguments.length; i++) {
        const { name, value } = decoding.arguments[i];
        const nativized = ethersCompatibleNativize(value, numberFormatter);
        result[i] = nativized;
        if (name) {
            result[name] = nativized;
        }
    }
    //note: if you have an argument named __length__, what ethers
    //actually does is... weird.  we're just going to do this instead,
    //which is simpler and probably more useful, even if it's not strictly
    //the same (I *seriously* doubt anyone was relying on the old behavior,
    //because it's, uh, not very useful)
    result.__length__ = decoding.arguments.length;
    return result;
}
//# sourceMappingURL=export.js.map
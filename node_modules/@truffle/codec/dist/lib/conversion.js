"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanBool = exports.countDecimalPlaces = exports.shiftBigDown = exports.shiftBigUp = exports.toBytes = exports.toHexString = exports.toBig = exports.toBigInt = exports.toSignedBN = exports.toBN = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:conversion");
const bn_js_1 = __importDefault(require("bn.js"));
const big_js_1 = __importDefault(require("big.js"));
/**
 * @param bytes - undefined | string | number | BN | Uint8Array | Big
 * @return {BN}
 */
function toBN(bytes) {
    if (bytes === undefined) {
        return undefined;
    }
    else if (typeof bytes == "string") {
        return new bn_js_1.default(bytes, 16);
    }
    else if (typeof bytes == "number" || bn_js_1.default.isBN(bytes)) {
        return new bn_js_1.default(bytes);
    }
    else if (bytes instanceof big_js_1.default) {
        return new bn_js_1.default(bytes.toFixed()); //warning, better hope input is integer!
        //note: going through string may seem silly but it's actually not terrible here,
        //since BN is binary-based and Big is decimal-based
        //[toFixed is like toString except it guarantees scientific notation is not used]
    }
    else if (typeof bytes.reduce === "function") {
        return bytes.reduce((num, byte) => num.shln(8).addn(byte), new bn_js_1.default(0));
    }
}
exports.toBN = toBN;
/**
 * @param bytes - Uint8Array
 * @return {BN}
 */
function toSignedBN(bytes) {
    if (bytes[0] < 0x80) {
        // if first bit is 0
        return toBN(bytes);
    }
    else {
        return toBN(bytes.map(b => 0xff - b))
            .addn(1)
            .neg();
    }
}
exports.toSignedBN = toSignedBN;
function toBigInt(value) {
    //BN is binary-based, so we convert by means of a hex string in order
    //to avoid having to do a binary-decimal conversion and back :P
    return !value.isNeg()
        ? BigInt("0x" + value.toString(16))
        : -BigInt("0x" + value.neg().toString(16)); //can't directly make negative BigInt from hex string
}
exports.toBigInt = toBigInt;
function toBig(value) {
    //note: going through string may seem silly but it's actually not terrible here,
    //since BN (& number) is binary-based and Big is decimal-based
    return new big_js_1.default(value.toString());
}
exports.toBig = toBig;
/**
 * @param bytes - Uint8Array | BN
 * @param padLength - number - minimum desired byte length (left-pad with zeroes)
 * @param padRight - boolean - causes padding to occur on right instead of left
 * @return {string}
 */
function toHexString(bytes, padLength = 0, padRight = false) {
    if (bn_js_1.default.isBN(bytes)) {
        bytes = toBytes(bytes);
    }
    const pad = (s) => `${"00".slice(0, 2 - s.length)}${s}`;
    //                                          0  1  2  3  4
    //                                 0  1  2  3  4  5  6  7
    // bytes.length:        5  -  0x(          e5 c2 aa 09 11 )
    // length (preferred):  8  -  0x( 00 00 00 e5 c2 aa 09 11 )
    //                                `--.---'
    //                                     offset 3
    if (bytes.length < padLength) {
        let prior = bytes;
        bytes = new Uint8Array(padLength);
        if (padRight) {
            //unusual case: pad on right
            bytes.set(prior);
        }
        else {
            //usual case
            bytes.set(prior, padLength - prior.length);
        }
    }
    debug("bytes: %o", bytes);
    let string = bytes.reduce((str, byte) => `${str}${pad(byte.toString(16))}`, "");
    return `0x${string}`;
}
exports.toHexString = toHexString;
function toBytes(data, length = 0) {
    //note that length is a minimum output length
    //strings will be 0-padded on left
    //numbers/BNs will be sign-padded on left
    //NOTE: if a number/BN is passed in that is too big for the given length,
    //you will get an error!
    //(note that strings passed in should be hex strings; this is not for converting
    //generic strings to hex)
    if (typeof data === "string") {
        let hex = data; //renaming for clarity
        if (hex.startsWith("0x")) {
            hex = hex.slice(2);
        }
        if (hex === "") {
            //this special case is necessary because the match below will return null,
            //not an empty array, when given an empty string
            return new Uint8Array(0);
        }
        if (hex.length % 2 == 1) {
            hex = `0${hex}`;
        }
        let bytes = new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        if (bytes.length < length) {
            let prior = bytes;
            bytes = new Uint8Array(length);
            bytes.set(prior, length - prior.length);
        }
        return bytes;
    }
    else {
        // BN/Big/number case
        if (typeof data === "number") {
            data = new bn_js_1.default(data);
        }
        else if (data instanceof big_js_1.default) {
            //note: going through string may seem silly but it's actually not terrible here,
            //since BN is binary-based and Big is decimal-based
            data = new bn_js_1.default(data.toFixed());
            //[toFixed is like toString except it guarantees scientific notation is not used]
        }
        //note that the argument for toTwos is given in bits
        return data.toTwos(length * 8).toArrayLike(Uint8Array, "be", length);
        //big-endian
    }
}
exports.toBytes = toBytes;
//computes value * 10**decimalPlaces
function shiftBigUp(value, decimalPlaces) {
    let newValue = new big_js_1.default(value);
    newValue.e += decimalPlaces;
    return newValue;
}
exports.shiftBigUp = shiftBigUp;
//computes value * 10**-decimalPlaces
function shiftBigDown(value, decimalPlaces) {
    let newValue = new big_js_1.default(value);
    newValue.e -= decimalPlaces;
    return newValue;
}
exports.shiftBigDown = shiftBigDown;
//we don't need this yet, but we will eventually
function countDecimalPlaces(value) {
    return Math.max(0, value.c.length - value.e - 1);
}
exports.countDecimalPlaces = countDecimalPlaces;
//converts out of range booleans to true; something of a HACK
//NOTE: does NOT do this recursively inside structs, arrays, etc!
//I mean, those aren't elementary and therefore aren't in the domain
//anyway, but still
function cleanBool(result) {
    switch (result.kind) {
        case "value":
            return result;
        case "error":
            switch (result.error.kind) {
                case "BoolOutOfRangeError":
                    //return true
                    return {
                        type: result.type,
                        kind: "value",
                        value: {
                            asBoolean: true
                        }
                    };
                default:
                    return result;
            }
    }
}
exports.cleanBool = cleanBool;
//# sourceMappingURL=conversion.js.map
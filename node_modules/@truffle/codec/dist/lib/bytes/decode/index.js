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
exports.decodeString = exports.decodeBytes = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:bytes:decode");
const read_1 = __importDefault(require("../../read"));
const Conversion = __importStar(require("../../conversion"));
const errors_1 = require("../../errors");
const utf8_1 = __importDefault(require("utf8"));
function* decodeBytes(dataType, pointer, info, options = {}) {
    const { state } = info;
    const { strictAbiMode: strict } = options; //if this is undefined it'll still be falsy so OK
    let bytes;
    try {
        bytes = yield* read_1.default(pointer, state);
    }
    catch (error) {
        debug("segfault, pointer %o, state: %O", pointer, state);
        return errors_1.handleDecodingError(dataType, error, strict);
    }
    debug("type %O", dataType);
    debug("pointer %o", pointer);
    //note: this function does not check padding
    switch (dataType.typeClass) {
        case "bytes":
            //we assume this is a dynamic bytestring!
            //static ones should go to decodeBasic!
            return {
                type: dataType,
                kind: "value",
                value: {
                    asHex: Conversion.toHexString(bytes)
                }
            };
        case "string":
            return {
                type: dataType,
                kind: "value",
                value: decodeString(bytes)
            };
    }
}
exports.decodeBytes = decodeBytes;
function decodeString(bytes) {
    //the following line takes our UTF-8 string... and interprets each byte
    //as a UTF-16 bytepair.  Yikes!  Fortunately, we have a library to repair that.
    let badlyEncodedString = String.fromCharCode.apply(undefined, bytes);
    try {
        //this will throw an error if we have malformed UTF-8
        let correctlyEncodedString = utf8_1.default.decode(badlyEncodedString);
        //NOTE: we don't use node's builtin Buffer class to do the UTF-8 decoding
        //here, because that handles malformed UTF-8 by means of replacement characters
        //(U+FFFD).  That loses information.  So we use the utf8 package instead,
        //and... well, see the catch block below.
        return {
            kind: "valid",
            asString: correctlyEncodedString
        };
    }
    catch (_a) {
        //we're going to ignore the precise error and just assume it's because
        //the string was malformed (what else could it be?)
        let hexString = Conversion.toHexString(bytes);
        return {
            kind: "malformed",
            asHex: hexString
        };
    }
}
exports.decodeString = decodeString;
//# sourceMappingURL=index.js.map
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
exports.decodeConstant = void 0;
/**
 * @protected
 *
 * @packageDocumentation
 */
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:ast:decode");
const read_1 = __importDefault(require("../../read"));
const Conversion = __importStar(require("../../conversion"));
const Basic = __importStar(require("../../basic"));
const Bytes = __importStar(require("../../bytes"));
const errors_1 = require("../../errors");
function* decodeConstant(dataType, pointer, info) {
    debug("pointer %o", pointer);
    //normally, we just dispatch to decodeBasic or decodeBytes.
    //for statically-sized bytes, however, we need to make a special case.
    //you see, decodeBasic expects to find the bytes at the *beginning*
    //of the word, but readDefinition will put them at the *end* of the
    //word.  So we'll have to adjust things ourselves.
    //(if the constant is a string constant, it'll be *just* the bytes, so
    //we have to pad it...)
    if (dataType.typeClass === "bytes" && dataType.kind === "static") {
        const size = dataType.length;
        let word;
        try {
            word = yield* read_1.default(pointer, info.state);
        }
        catch (error) {
            return errors_1.handleDecodingError(dataType, error);
        }
        debug("got word: %O", word);
        //not bothering to check padding; shouldn't be necessary
        const bytes = word.slice(-size); //isolate the bytes we want (works in both cases, even if string literal is short)
        return {
            type: dataType,
            kind: "value",
            value: {
                asHex: Conversion.toHexString(bytes, size, true) //padding in case of short string literal
            }
        }; //we'll skip including a raw value, as that would be meaningless
    }
    //otherwise, as mentioned, just dispatch to decodeBasic or decodeBytes
    debug("not a static bytes");
    if (dataType.typeClass === "bytes" || dataType.typeClass === "string") {
        return yield* Bytes.Decode.decodeBytes(dataType, pointer, info);
    }
    return yield* Basic.Decode.decodeBasic(dataType, pointer, info);
}
exports.decodeConstant = decodeConstant;
//# sourceMappingURL=index.js.map